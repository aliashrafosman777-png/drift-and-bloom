import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

async function waitForServer(child: ChildProcess, output: () => string) {
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before E2E setup completed.\n${output()}`)
    }
    try {
      const response = await fetch('http://127.0.0.1:3100/api/products?packageCategory=fish&limit=1')
      if (response.ok) return
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Timed out waiting for the E2E server.\n${output()}`)
}

export default async function globalSetup() {
  const baseUri = process.env.MONGODB_URI
  if (!baseUri) throw new Error('MONGODB_URI is required for the isolated E2E database.')
  const databaseName = `dbe2e_${Date.now().toString(36)}_${process.pid}`
  const isolatedUri = new URL(baseUri)
  isolatedUri.pathname = `/${databaseName}`
  const mongoUri = isolatedUri.toString()
  const jwtSecret = 'e2e-test-secret-with-sufficient-length'

  await mongoose.connect(mongoUri)
  const userId = new mongoose.Types.ObjectId()
  await mongoose.connection.db.collection('users').insertOne({
    _id: userId,
    firstName: 'E2E',
    lastName: 'Admin',
    email: 'e2e-admin@example.test',
    phone: '',
    role: 'admin',
    isVerified: true,
    lastLogin: null,
    wishlist: [],
    cart: [],
    addresses: [],
    gameProgress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  await mongoose.disconnect()

  process.env.E2E_ADMIN_TOKEN = jwt.sign(
    { userId: userId.toString(), role: 'admin' },
    jwtSecret,
    { expiresIn: '1h' },
  )

  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')
  let serverOutput = ''
  const child = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', '3100'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      MONGODB_URI: mongoUri,
      EXPECTED_MONGODB_DATABASE: databaseName,
      JWT_SECRET: jwtSecret,
      DATA_SOURCE_ID: 'e2e-isolated',
      NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3100',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  child.stdout?.on('data', (chunk) => { serverOutput = `${serverOutput}${chunk}`.slice(-12_000) })
  child.stderr?.on('data', (chunk) => { serverOutput = `${serverOutput}${chunk}`.slice(-12_000) })

  try {
    await waitForServer(child, () => serverOutput)
  } catch (error) {
    child.kill()
    await mongoose.connect(mongoUri)
    if (mongoose.connection.db.databaseName === databaseName && databaseName.startsWith('dbe2e_')) {
      await mongoose.connection.db.dropDatabase()
    }
    await mongoose.disconnect()
    throw error
  }

  return async () => {
    child.kill()
    await new Promise<void>((resolve) => {
      if (child.exitCode !== null) return resolve()
      child.once('exit', () => resolve())
      setTimeout(resolve, 5_000)
    })
    await mongoose.connect(mongoUri)
    if (mongoose.connection.db.databaseName !== databaseName || !databaseName.startsWith('dbe2e_')) {
      throw new Error('Refusing to clean up an unexpected E2E database.')
    }
    await mongoose.connection.db.dropDatabase()
    await mongoose.disconnect()
  }
}
