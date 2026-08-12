import { spawn, type ChildProcess } from 'node:child_process'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
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

async function stopServer(child: ChildProcess) {
  child.kill()
  await new Promise<void>((resolve) => {
    if (child.exitCode !== null) return resolve()
    child.once('exit', () => resolve())
    setTimeout(resolve, 5_000)
  })
}

export default async function globalSetup() {
  const baseUri = process.env.MONGODB_URI
  if (!baseUri) throw new Error('MONGODB_URI is required for the isolated E2E database.')
  const databaseName = `dbe2e_${Date.now().toString(36)}_${process.pid}`
  const isolatedUri = new URL(baseUri)
  isolatedUri.pathname = `/${databaseName}`
  const mongoUri = isolatedUri.toString()
  const jwtSecret = 'e2e-test-secret-with-sufficient-length'
  const distDir = `.next-e2e-${databaseName}`
  const distPath = path.resolve(process.cwd(), distDir)

  if (
    path.dirname(distPath) !== process.cwd() ||
    !path.basename(distPath).startsWith('.next-e2e-dbe2e_')
  ) {
    throw new Error('Refusing to use an unexpected E2E build directory.')
  }

  const generatedConfigPaths = [
    path.resolve(process.cwd(), 'next-env.d.ts'),
    path.resolve(process.cwd(), 'tsconfig.json'),
  ]
  const generatedConfigSnapshots = await Promise.all(
    generatedConfigPaths.map((filePath) => readFile(filePath)),
  )
  const restoreGeneratedConfigs = async () => {
    await Promise.all(generatedConfigPaths.map(async (filePath, index) => {
      const current = await readFile(filePath, 'utf8')
      if (current.includes(distDir)) {
        await writeFile(filePath, generatedConfigSnapshots[index])
      }
    }))
  }

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
  const startServer = () => {
    serverOutput = ''
    const nextServer = spawn(process.execPath, [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', '3100'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MONGODB_URI: mongoUri,
        EXPECTED_MONGODB_DATABASE: databaseName,
        JWT_SECRET: jwtSecret,
        DATA_SOURCE_ID: 'e2e-isolated',
        NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3100',
        NEXT_DIST_DIR: distDir,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    nextServer.stdout?.on('data', (chunk) => { serverOutput = `${serverOutput}${chunk}`.slice(-12_000) })
    nextServer.stderr?.on('data', (chunk) => { serverOutput = `${serverOutput}${chunk}`.slice(-12_000) })
    return nextServer
  }

  let child = startServer()

  try {
    await waitForServer(child, () => serverOutput)
  } catch (error) {
    await stopServer(child)
    await mongoose.connect(mongoUri)
    if (mongoose.connection.db.databaseName === databaseName && databaseName.startsWith('dbe2e_')) {
      await mongoose.connection.db.dropDatabase()
    }
    await mongoose.disconnect()
    await restoreGeneratedConfigs()
    await rm(distPath, { recursive: true, force: true })
    throw error
  }

  let restartInProgress: Promise<void> | null = null
  const controlServer = createServer((request, response) => {
    if (request.method !== 'POST' || request.url !== '/restart') {
      response.writeHead(404).end()
      return
    }

    restartInProgress ??= (async () => {
      await stopServer(child)
      child = startServer()
      await waitForServer(child, () => serverOutput)
    })().finally(() => {
      restartInProgress = null
    })

    void restartInProgress.then(() => {
      response.writeHead(204).end()
    }).catch((error) => {
      response.writeHead(500, { 'Content-Type': 'text/plain' })
      response.end(error instanceof Error ? error.message : 'E2E server restart failed.')
    })
  })
  await new Promise<void>((resolve, reject) => {
    controlServer.once('error', reject)
    controlServer.listen(0, '127.0.0.1', resolve)
  })
  const controlAddress = controlServer.address()
  if (!controlAddress || typeof controlAddress === 'string') {
    throw new Error('Could not determine the E2E restart controller address.')
  }
  process.env.E2E_CONTROL_URL = `http://127.0.0.1:${controlAddress.port}`

  return async () => {
    await new Promise<void>((resolve, reject) => {
      controlServer.close((error) => error ? reject(error) : resolve())
    })
    await stopServer(child)
    await mongoose.connect(mongoUri)
    if (mongoose.connection.db.databaseName !== databaseName || !databaseName.startsWith('dbe2e_')) {
      throw new Error('Refusing to clean up an unexpected E2E database.')
    }
    await mongoose.connection.db.dropDatabase()
    await mongoose.disconnect()
    await restoreGeneratedConfigs()
    await rm(distPath, { recursive: true, force: true })
  }
}
