// Quick script to check what products exist in MongoDB Atlas
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aliashrafosman777_db_user:Ay1JbGwq9Ky8lvoE@driftnblooms.ukjvmrs.mongodb.net/driftandbloom?retryWrites=true&w=majority&appName=driftnblooms'

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await mongoose.connect(MONGODB_URI)
    console.log('✓ Connected\n')

    const db = mongoose.connection.db
    const products = await db.collection('products').find({}, {
      projection: { _id: 1, name: 1, slug: 1, isActive: 1, price: 1 }
    }).toArray()

    console.log(`Found ${products.length} products:\n`)
    products.forEach(p => {
      console.log(`  _id: ${p._id}`)
      console.log(`  name: ${p.name}`)
      console.log(`  slug: ${p.slug}`)
      console.log(`  isActive: ${p.isActive}`)
      console.log(`  price: ${p.price}`)
      console.log('  ---')
    })

    // Also check orders collection
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(3).toArray()
    console.log(`\nLast ${orders.length} orders:`)
    orders.forEach(o => {
      console.log(`  _id: ${o._id}, status: ${o.orderStatus}, items: ${o.items?.length}`)
    })

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

checkProducts()
