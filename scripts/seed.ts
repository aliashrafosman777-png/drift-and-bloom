// @ts-nocheck
/**
 * Database Seed Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Populates MongoDB with the existing Drift & Bloom seed data:
 *   • Admin user (admin@driftandbloom.com / admin123)
 *   • 10 curated collection products
 *   • 9 package-builder products
 *   • 7 categories
 *   • Sample orders
 *   • Sample coupon
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed.ts
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

// ─── Import Models ──────────────────────────────────────────────────────────
// We need to register schemas before using them
import '../src/models/Product'
import '../src/models/Category'
import '../src/models/User'
import '../src/models/Order'
import '../src/models/Review'
import '../src/models/Coupon'

const Product = mongoose.model('Product')
const Category = mongoose.model('Category')
const User = mongoose.model('User')
const Order = mongoose.model('Order')
const Coupon = mongoose.model('Coupon')

// ─── Seed Data ──────────────────────────────────────────────────────────────

const categories = [
  { name: 'All', slug: 'all', description: 'All products' },
  { name: 'Best Seller', slug: 'best-seller', description: 'Our most popular packages' },
  { name: 'Calm', slug: 'calm', description: 'Packages for peace and quiet moments' },
  { name: 'Gifting', slug: 'gifting', description: 'Perfect for giving to loved ones' },
  { name: 'Love', slug: 'love', description: 'Romantic and heartfelt collections' },
  { name: 'Self-Care', slug: 'self-care', description: 'Nurture yourself' },
  { name: 'New Beginnings', slug: 'new-beginnings', description: 'Fresh starts and new chapters' },
]

const collectionProducts = [
  {
    name: 'Return',
    slug: 'return',
    tagline: 'Come back to what truly matters.',
    description: 'A gentle invitation to slow down and reconnect with yourself. The Return Collection pairs a hand-potted plant with a softly scented candle and a keepsake story card, made for quiet mornings and long exhales.',
    price: 1250,
    rating: 4.8,
    reviewsCount: 86,
    category: ['best-seller', 'calm'],
    bestSeller: true,
    mood: ['calm', 'relaxation'],
    image: '/assets/return.jpeg',
    gallery: ['/assets/return/collection.jpeg', '/assets/return/1.jpeg', '/assets/return/2.jpeg', '/assets/return/3.jpeg'],
    scent: 'Sandalwood + Sage',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Spider Plant', petFriendly: true, note: 'Safe for pets, easy to care for. Thrives in indirect light.' },
      { name: 'Golden Pothos', petFriendly: false, note: 'A hardy, trailing plant that adds lush greenery to any space.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Growth',
    slug: 'growth',
    tagline: 'Root deeper. Grow into your best.',
    description: 'For new beginnings and quiet ambition. The Growth Collection brings a resilient plant, a warm vanilla-bamboo candle, and a handwritten note of encouragement to whoever needs a reminder that they are blooming right on time.',
    price: 1350,
    rating: 4.9,
    reviewsCount: 124,
    category: ['best-seller', 'new-beginnings'],
    bestSeller: true,
    mood: ['motivation', 'energy'],
    image: '/assets/growth.jpeg',
    gallery: ['/assets/growth/collection.jpeg', '/assets/growth/1.jpeg', '/assets/growth/2.jpeg', '/assets/growth/3.jpeg'],
    scent: 'Fresh Bamboo',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Snake Plant', petFriendly: true, note: 'Low-maintenance and nearly impossible to kill. Great for beginners.' },
      { name: 'Money Plant', petFriendly: false, note: 'A trailing favorite said to bring good fortune to any room.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Stillness',
    slug: 'stillness',
    tagline: 'A pause that restores your soul.',
    description: 'Stillness is a calming blend of plants, scents and intentional touches designed to help you create space for peace. Perfect for the over-thinker who needs permission to simply sit and breathe.',
    price: 1250,
    rating: 4.7,
    reviewsCount: 102,
    category: ['calm', 'self-care'],
    mood: ['calm', 'comfort'],
    image: '/assets/stillness.jpeg',
    gallery: ['/assets/stillness/collection.jpeg', '/assets/stillness/1.jpeg', '/assets/stillness/2.jpeg', '/assets/stillness/3.jpeg'],
    scent: 'Lavender + Chamomile',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Peace Lily', petFriendly: true, note: 'Air-purifying and calming, with elegant white blooms.' },
      { name: 'Lavender Plant', petFriendly: false, note: 'Fragrant and soothing — best kept somewhere sunny.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Home',
    slug: 'home',
    tagline: 'Create a space that feels like you.',
    description: "Home is more than a place — it's a feeling. This collection is a gentle reminder of comfort, safety and the little things that make a space your own.",
    price: 1350,
    rating: 4.9,
    reviewsCount: 158,
    category: ['best-seller', 'gifting'],
    bestSeller: true,
    mood: ['comfort', 'balance'],
    image: '/assets/home.jpeg',
    gallery: ['/assets/home/collection.jpeg', '/assets/home/1.jpeg', '/assets/home/2.jpeg', '/assets/home/3.jpeg'],
    scent: 'Vanilla + Cotton',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Spider Plant', petFriendly: true, note: 'Safe for pets and easy to care for. Thrives in indirect light.' },
      { name: 'Golden Pothos', petFriendly: false, note: 'A hardy, trailing plant that adds lush greenery to any space.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Grounded',
    slug: 'grounded',
    tagline: 'Stay present. Root into peace.',
    description: 'Grounded brings together earthy textures and calming scents for anyone who needs to feel steady again.',
    price: 1250,
    rating: 4.6,
    reviewsCount: 64,
    category: ['calm', 'self-care'],
    mood: ['balance', 'comfort'],
    image: '/assets/grounded.jpeg',
    gallery: ['/assets/grounded/collection.jpeg', '/assets/grounded/1.jpeg', '/assets/grounded/2.jpeg', '/assets/grounded/3.jpeg'],
    scent: 'Cedarwood + Moss',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'ZZ Plant', petFriendly: false, note: 'Practically indestructible and thrives on neglect.' },
      { name: 'Areca Palm', petFriendly: true, note: 'Pet-safe and brings a soft, tropical feel to any room.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Joy',
    slug: 'joy',
    tagline: 'Little moments, endless light.',
    description: "Joy is for celebrating the small stuff — a promotion, a Tuesday, a good cup of coffee. Bright, warm and a little playful, it's built to make someone smile the second they open the box.",
    price: 1350,
    rating: 4.8,
    reviewsCount: 97,
    category: ['gifting', 'best-seller'],
    bestSeller: true,
    mood: ['energy', 'motivation'],
    image: '/assets/joy.jpeg',
    gallery: ['/assets/joy/1.jpeg', '/assets/joy/2.jpeg'],
    scent: 'Citrus + Honey',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Calathea', petFriendly: true, note: 'Playful patterned leaves that fold up at night.' },
      { name: 'Pothos Marble Queen', petFriendly: false, note: 'Variegated and easy-going, brightens any corner.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Love',
    slug: 'love',
    tagline: 'Give love. Feel love. Be love.',
    description: "A soft, romantic collection for partners, friends or yourself. Love pairs a delicate plant with a warm candle and a heartfelt note — the perfect way to say what words sometimes can't.",
    price: 1450,
    rating: 4.9,
    reviewsCount: 211,
    category: ['love', 'gifting', 'best-seller'],
    bestSeller: true,
    mood: ['comfort', 'calm'],
    image: '/assets/love.jpeg',
    gallery: ['/assets/love/collection.jpeg', '/assets/love/1.jpeg', '/assets/love/2.jpeg', '/assets/love/3.jpeg'],
    scent: 'Rose + Amber',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Anthurium', petFriendly: false, note: 'Heart-shaped blooms that last for weeks.' },
      { name: 'String of Hearts', petFriendly: true, note: 'A delicate, trailing vine with tiny heart-shaped leaves.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Dream',
    slug: 'dream',
    tagline: 'Nourish your dreams. Trust the night.',
    description: 'Dream is built for wind-down rituals — soft light, soothing scent and a plant that thrives in low light, just like you do at the end of a long day.',
    price: 1250,
    rating: 4.7,
    reviewsCount: 73,
    category: ['calm', 'self-care'],
    mood: ['calm', 'comfort'],
    image: '/assets/dream.jpeg',
    gallery: ['/assets/dream/collection.jpeg', '/assets/dream/1.jpeg', '/assets/dream/2.jpeg'],
    scent: 'Lavender + Night Jasmine',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Snake Plant', petFriendly: true, note: 'Releases oxygen at night — a gentle bedroom companion.' },
      { name: 'ZZ Plant', petFriendly: false, note: 'Thrives in low light and asks for almost nothing.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Renewal',
    slug: 'renewal',
    tagline: 'New energy. Fresh beginnings.',
    description: 'Renewal is a clean slate in a box. Crisp scents and a hardy young plant make this the go-to gift for new homes, new jobs, and new chapters of any kind.',
    price: 1350,
    rating: 4.6,
    reviewsCount: 58,
    category: ['new-beginnings', 'gifting'],
    mood: ['motivation', 'energy'],
    image: '/assets/renewal.jpeg',
    gallery: ['/assets/renewal/collection.jpeg', '/assets/renewal/1.jpeg', '/assets/renewal/2.jpeg', '/assets/renewal/3.jpeg'],
    scent: 'Eucalyptus + Mint',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Pothos', petFriendly: false, note: 'Fast-growing and forgiving — perfect for a fresh start.' },
      { name: 'Spider Plant', petFriendly: true, note: 'Resilient and pet-friendly, easy to keep alive anywhere.' },
    ],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Balance',
    slug: 'balance',
    tagline: 'Find harmony in everyday.',
    description: 'Balance brings structure and softness together — an easy-care plant, a grounding candle scent, and a note to remind you that "enough" is a place you can return to.',
    price: 1250,
    rating: 4.8,
    reviewsCount: 91,
    category: ['calm', 'self-care', 'best-seller'],
    bestSeller: true,
    mood: ['balance', 'comfort'],
    image: '/assets/balance.jpeg',
    gallery: ['/assets/balance/collection.jpeg', '/assets/balance/1.jpeg', '/assets/balance/2.jpeg', '/assets/balance/3.jpeg'],
    scent: 'Sandalwood + Bergamot',
    includes: ['Live Plant', 'Scented Candle', 'Story Card', 'Themed Packaging'],
    plantOptions: [
      { name: 'Peace Lily', petFriendly: true, note: 'Calming, air-purifying, and forgiving of inconsistent watering.' },
      { name: 'Rubber Plant', petFriendly: false, note: 'Glossy leaves and a strong, upright shape for any room.' },
    ],
    isActive: true,
    stock: 50,
  },
]

const packageBuilderProducts = [
  {
    name: 'Lavender Candle',
    slug: 'candle-lavender',
    price: 650,
    description: 'A hand-poured lavender candle made for quiet evenings, soft light, and a calmer room rhythm.',
    shortDescription: 'Calming lavender for evening rituals.',
    image: '/assets/candles.jpeg',
    packageCategory: 'candles',
    category: ['candles'],
    story: 'Lavender Candle was created for the moment the room finally becomes yours again.',
    tags: ['Floral', 'Relaxing', 'Handmade'],
    isActive: true,
    stock: 100,
  },
  {
    name: 'Vanilla Candle',
    slug: 'candle-vanilla',
    price: 620,
    description: 'Warm vanilla, soft cream, and a gentle amber base that makes the whole package feel comforting.',
    shortDescription: 'Soft vanilla warmth with a creamy finish.',
    image: '/assets/candles.jpeg',
    packageCategory: 'candles',
    category: ['candles'],
    story: 'Vanilla Candle is made for slow mornings, handwritten notes, and homes that feel tender.',
    tags: ['Warm', 'Cozy', 'Soft'],
    isActive: true,
    stock: 100,
  },
  {
    name: 'Ocean Breeze Candle',
    slug: 'candle-ocean-breeze',
    price: 680,
    description: 'A clean coastal candle with sea air, white woods, and a fresh mineral finish.',
    shortDescription: 'Fresh coastal air for bright spaces.',
    image: '/assets/candles.jpeg',
    packageCategory: 'candles',
    category: ['candles'],
    story: 'Ocean Breeze was blended for open windows, clear thoughts, and the feeling of breathing deeper.',
    tags: ['Fresh', 'Clean', 'Refreshing'],
    isActive: true,
    stock: 100,
  },
  {
    name: 'Snake Plant',
    slug: 'plant-snake',
    price: 420,
    description: 'A sculptural, low-maintenance plant with strong upright leaves and a calm architectural presence.',
    shortDescription: 'Low-maintenance structure for calm corners.',
    image: '/assets/plants.jpeg',
    packageCategory: 'plants',
    category: ['plants'],
    story: 'Snake Plant is the steady friend of the package — resilient, elegant, and happy with simple care.',
    tags: ['Easy Care', 'Airy', 'Minimal'],
    isActive: true,
    stock: 100,
  },
  {
    name: 'Monstera',
    slug: 'plant-monstera',
    price: 760,
    description: 'A bold botanical statement with generous leaves that brings a lush, premium feeling to the package.',
    shortDescription: 'Lush statement leaves with tropical energy.',
    image: '/assets/plants.jpeg',
    packageCategory: 'plants',
    category: ['plants'],
    story: 'Monstera was chosen for people who want their space to feel alive, expressive, and beautifully growing.',
    tags: ['Botanical', 'Statement', 'Lush'],
    isActive: true,
    stock: 100,
  },
  {
    name: 'Peace Lily',
    slug: 'plant-peace-lily',
    price: 540,
    description: 'A graceful plant with glossy leaves and white blooms that adds softness and quiet balance.',
    shortDescription: 'Soft white blooms for peaceful rooms.',
    image: '/assets/plants.jpeg',
    packageCategory: 'plants',
    category: ['plants'],
    story: 'Peace Lily brings a quiet kind of beauty — simple, gentle, and made for rooms that need softness.',
    tags: ['Floral', 'Elegant', 'Calm'],
    isActive: true,
    stock: 100,
  },
  {
    name: 'Mini Aquarium',
    slug: 'tank-mini-aquarium',
    price: 950,
    description: 'A compact premium fish tank with a soft botanical setup, ideal for desks, shelves, and small rituals.',
    shortDescription: 'Compact aquarium for refined small spaces.',
    image: '/assets/fishs.jpeg',
    packageCategory: 'fish',
    category: ['fish'],
    story: 'Mini Aquarium is a tiny world of movement and stillness, designed to make even a small corner feel considered.',
    tags: ['Compact', 'Calm', 'Desk Friendly'],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Medium Aquarium',
    slug: 'tank-medium-aquarium',
    price: 1450,
    description: 'A balanced mid-size aquarium with sand, greenery, and enough presence to anchor a beautiful room corner.',
    shortDescription: 'Balanced size with a calm botanical scene.',
    image: '/assets/fishs.jpeg',
    packageCategory: 'fish',
    category: ['fish'],
    story: 'Medium Aquarium is for the person who wants a living centerpiece — calm, expressive, and never loud.',
    tags: ['Balanced', 'Botanical', 'Premium'],
    isActive: true,
    stock: 50,
  },
  {
    name: 'Premium Aquarium',
    slug: 'tank-premium-aquarium',
    price: 2200,
    description: 'A larger luxury aquarium concept with layered greenery, soft sand, and a refined centerpiece feeling.',
    shortDescription: 'A premium living centerpiece for gifting.',
    image: '/assets/fishs.jpeg',
    packageCategory: 'fish',
    category: ['fish'],
    story: 'Premium Aquarium turns the package into a full visual ritual — a quiet underwater garden.',
    tags: ['Luxury', 'Statement', 'Gift Ready'],
    isActive: true,
    stock: 50,
  },
]

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Connecting to MongoDB…')
  await mongoose.connect(MONGODB_URI as string)
  console.log('✅ Connected\n')

  // Clear existing data
  console.log('🧹 Clearing existing data…')
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
    Order.deleteMany({}),
    Coupon.deleteMany({}),
  ])
  console.log('✅ Cleared\n')

  // Seed Categories
  console.log('📁 Seeding categories…')
  await Category.insertMany(categories)
  console.log(`   ✅ ${categories.length} categories\n`)

  // Seed Products
  console.log('📦 Seeding collection products…')
  const createdCollections = await Product.insertMany(collectionProducts)
  console.log(`   ✅ ${createdCollections.length} collections`)

  console.log('📦 Seeding package builder products…')
  const createdPackages = await Product.insertMany(packageBuilderProducts)
  console.log(`   ✅ ${createdPackages.length} package items\n`)

  // Seed Admin User
  console.log('👤 Seeding admin user…')
  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@driftandbloom.com',
    role: 'admin',
    isVerified: true,
  })
  console.log(`   ✅ admin@driftandbloom.com (use OTP login)\n`)

  // Seed Sample Customers
  console.log('👥 Seeding sample customers…')
  const customers = await User.insertMany([
    { firstName: 'Mona', lastName: 'El-Sayed', email: 'mona.elsayed@example.com', role: 'customer', isVerified: true },
    { firstName: 'Youssef', lastName: 'Adel', email: 'youssef.adel@example.com', role: 'customer', isVerified: true },
    { firstName: 'Salma', lastName: 'Tarek', email: 'salma.tarek@example.com', role: 'customer', isVerified: true },
    { firstName: 'Omar', lastName: 'Khaled', email: 'omar.khaled@example.com', role: 'customer', isVerified: true },
    { firstName: 'Nour', lastName: 'Hassan', email: 'nour.hassan@example.com', role: 'customer', isVerified: true },
  ])
  console.log(`   ✅ ${customers.length} customers\n`)

  // Seed Sample Orders
  console.log('🛒 Seeding sample orders…')
  const sampleOrders = [
    {
      customer: customers[0]._id,
      fullName: 'Mona El-Sayed', phone: '01012345678', email: 'mona.elsayed@example.com',
      items: [
        { product: createdCollections[0]._id, name: 'Return', price: 1250, quantity: 1, image: '/assets/return.jpeg' },
        { product: createdCollections[3]._id, name: 'Home', price: 1350, quantity: 1, image: '/assets/home.jpeg' },
      ],
      subtotal: 2600, discount: 0, shipping: 0, tax: 300, total: 2900,
      paymentMethod: 'Card', paymentStatus: 'paid', orderStatus: 'Delivered',
      shippingAddress: { street: '15 Tahrir St', city: 'Cairo', zip: '11511' },
      instructionLanguage: 'Arabic',
    },
    {
      customer: customers[1]._id,
      fullName: 'Youssef Adel', phone: '01198765432', email: 'youssef.adel@example.com',
      items: [
        { product: createdCollections[1]._id, name: 'Growth', price: 1350, quantity: 1, image: '/assets/growth.jpeg' },
      ],
      subtotal: 1350, discount: 0, shipping: 100, tax: 0, total: 1350,
      paymentMethod: 'Cash on Delivery', paymentStatus: 'pending', orderStatus: 'Shipped',
      shippingAddress: { street: '22 El Nasr Rd', city: 'Alexandria', zip: '21500' },
      instructionLanguage: 'English',
    },
    {
      customer: customers[2]._id,
      fullName: 'Salma Tarek', phone: '01055557777', email: 'salma.tarek@example.com',
      items: [
        { product: createdCollections[6]._id, name: 'Love', price: 1450, quantity: 2, image: '/assets/love.jpeg' },
        { product: createdCollections[2]._id, name: 'Stillness', price: 1250, quantity: 1, image: '/assets/stillness.jpeg' },
      ],
      subtotal: 4150, discount: 100, shipping: 0, tax: 0, total: 4050,
      paymentMethod: 'Card', paymentStatus: 'paid', orderStatus: 'Processing',
      shippingAddress: { street: '8 Corniche Rd', city: 'Hurghada', zip: '84511' },
      instructionLanguage: 'English',
    },
    {
      customer: customers[3]._id,
      fullName: 'Omar Khaled', phone: '01033334444', email: 'omar.khaled@example.com',
      items: [
        { product: createdCollections[0]._id, name: 'Return', price: 1250, quantity: 1, image: '/assets/return.jpeg' },
      ],
      subtotal: 1250, discount: 0, shipping: 100, tax: 0, total: 1250,
      paymentMethod: 'Card', paymentStatus: 'paid', orderStatus: 'Delivered',
      shippingAddress: { street: '5 Moez St', city: 'Cairo', zip: '11638' },
      instructionLanguage: 'Arabic',
    },
    {
      customer: customers[4]._id,
      fullName: 'Nour Hassan', phone: '01066669999', email: 'nour.hassan@example.com',
      items: [
        { product: createdCollections[0]._id, name: 'Return', price: 1250, quantity: 1, image: '/assets/return.jpeg' },
        { product: createdCollections[1]._id, name: 'Growth', price: 1350, quantity: 1, image: '/assets/growth.jpeg' },
      ],
      subtotal: 2600, discount: 0, shipping: 0, tax: 0, total: 2600,
      paymentMethod: 'Card', paymentStatus: 'paid', orderStatus: 'Delivered',
      shippingAddress: { street: '12 El Hegaz St', city: 'Cairo', zip: '11341' },
      instructionLanguage: 'English',
    },
  ]
  await Order.insertMany(sampleOrders)
  console.log(`   ✅ ${sampleOrders.length} orders\n`)

  // Seed Sample Coupon
  console.log('🎟️  Seeding sample coupon…')
  await Coupon.create({
    code: 'BLOOM20',
    discountType: 'percentage',
    discountValue: 20,
    expirationDate: new Date('2027-12-31'),
    isActive: true,
  })
  console.log('   ✅ BLOOM20 (20% off)\n')

  console.log('════════════════════════════════════════')
  console.log('✅ Seed completed successfully!')
  console.log('════════════════════════════════════════')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
