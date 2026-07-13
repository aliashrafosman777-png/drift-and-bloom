// @ts-nocheck
"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Check, FileText, Gift, Heart, X } from 'lucide-react'
import Container from '../components/common/Container'
import RatingStars from '../components/common/RatingStars'
import QuantitySelector from '../components/common/QuantitySelector'
import Button from '../components/common/Button'
import ProductCard from '../components/packages/ProductCard'
import PlantOptionSelector from '../components/packages/PlantOptionSelector'
import PackageIncludes from '../components/packages/PackageIncludes'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import { getBestPlantPair } from '../data/plants'
import { useToast } from '../components/common/Toast'
import { Stagger, fadeUp } from '../components/common/Motion'
import { getCollectionImage } from '../utils/collectionImages'
import OptimizedImage, { MotionOptimizedImage } from '../components/common/OptimizedImage'

export default function ProductDetails() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const { products } = useProducts()
  const { addToCart } = useCart()
  const { showToast } = useToast()

  // Look up from the LIVE context state — match by _id, id, OR slug so URL slugs work
  const product  = products.find((p) => p.id === id || p._id === id || p.slug === id) || null
  const related  = products.filter((p) => (p.id || p._id) !== (product?.id || product?._id)).slice(0, 5)

  const [activeImage, setActiveImage] = useState(0)
  const [quantity,    setQuantity]    = useState(1)
  const [petFriendly, setPetFriendly] = useState(true)
  const [added,       setAdded]       = useState(false)
  const [showPdf,     setShowPdf]     = useState(false)

  React.useEffect(() => {
    if (!product) router.replace('/packages')
  }, [product, router])

  if (!product) return null

  // Build plant context from this product's mood & id so the engine
  // picks plants that suit both the pet preference and the collection.
  const plantCtx = {
    petFriendly,
    mood: product.mood?.[0] || 'calm',
    collection: product.id,
  }
  const { petOption, nonPetOption } = getBestPlantPair(plantCtx)
  const selectedPlant = petFriendly ? petOption : nonPetOption

  const mainCollectionImage = getCollectionImage(product.name || product.id, product.image)
  const originalGallery = product.gallery || []
  const remainingGallery = originalGallery.length >= 3 ? originalGallery.slice(1) : originalGallery
  const gallery = [mainCollectionImage, ...remainingGallery].slice(0, 4)

  // Always use MongoDB _id for cart (not slug) — prevents ObjectId cast errors
  const cartProduct = {
    ...product,
    id: product._id || product.id,
  }

  const handleAddToCart = () => {
    addToCart(cartProduct, quantity, selectedPlant?.name)
    setAdded(true)
    showToast(`${quantity} × ${product.name} added to your cart.`)
  }

  const handleBuyNow = () => {
    addToCart(cartProduct, quantity, selectedPlant?.name)
    showToast(`${product.name} added. Taking you to checkout.`)
    router.push('/cart')
  }

  return (
    <>
      {/* Breadcrumb */}
      <Container className="py-6 text-xs text-charcoal/50">
        <Link href="/">Home</Link> / <Link href="/packages">Packages</Link> /{' '}
        <span className="text-charcoal">{product.name} Collection</span>
      </Container>

      {/* Main product grid */}
      <Container className="pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
          <MotionOptimizedImage
            src={gallery[activeImage]}
            alt={`${product.name} Collection`}
            className="w-full h-80 sm:h-[28rem] object-cover rounded-2xl shadow-soft"
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32 }}
          />
          <div className="flex items-center gap-3 mt-4 overflow-x-auto no-scrollbar">
            {gallery.map((img, i) => (
              <motion.button
                key={img + i}
                onClick={() => setActiveImage(i)}
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition duration-300 ${
                  activeImage === i ? 'border-olive' : 'border-transparent hover:border-gold/40'
                }`}
              >
                <OptimizedImage src={img} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>

          {/* Our Instruction Cards — pill-shaped card */}
          <motion.button
            onClick={() => setShowPdf(true)}
            whileHover={{ scale: 1.015, y: -3, boxShadow: '0 12px 32px rgba(107,114,84,0.15)' }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="group mt-6 w-full flex items-center gap-0 rounded-[60px] border border-charcoal/10 bg-white overflow-hidden shadow-sm hover:border-olive/30 transition-all duration-500 cursor-pointer text-left"
          >
            {/* Illustration side */}
            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-cream/40 p-3">
              <img
                src="/assets/care-cards-icon.png"
                alt="Drift & Bloom care illustration"
                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>

            {/* Text side */}
            <div className="flex-1 flex items-center justify-between px-5 sm:px-7 py-4">
              <div>
                <p className="font-serif text-base sm:text-lg text-charcoal tracking-wide">Our Instruction Cards</p>
                <p className="text-[11px] sm:text-xs text-charcoal/40 mt-0.5 tracking-wide">View plant & candle care guide</p>
              </div>
              <div className="shrink-0 ml-3 w-8 h-8 rounded-full bg-cream flex items-center justify-center group-hover:bg-olive group-hover:text-cream text-olive/50 transition-all duration-300">
                <FileText size={15} />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-charcoal/50 mb-3">
            <span className="flex items-center gap-1.5"><Heart size={14} className="text-brown" /> Comfort</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-brown" /> Quality Checked</span>
            <span className="flex items-center gap-1.5"><Gift size={14} className="text-brown" /> Gift Ready</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">{product.name}</h1>
          <p className="text-charcoal/50 italic mt-1">{product.tagline}</p>

          <div className="mt-3">
            <RatingStars rating={product.rating} reviews={product.reviews} size="text-base" />
          </div>

          <p className="text-charcoal/40 text-xs uppercase tracking-label mt-4">
            Candle Scent: {product.scent}
          </p>
          <p className="text-charcoal/70 mt-3 leading-relaxed text-sm sm:text-base">
            {product.description}
          </p>

          {/* Package Includes — matches reference image */}
          <div className="mt-7 pb-6 border-b border-charcoal/8">
            <PackageIncludes />
          </div>

          {product.plantOptions?.length > 0 && (
            <p className="text-xs text-charcoal/40 mt-5">
              🐾 Pet-friendly and non-pet-friendly plant options available below.
            </p>
          )}

          <p className="font-serif text-3xl text-charcoal mt-7">
            LE {product.price.toLocaleString()}
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-5">
            <span className="text-xs uppercase tracking-label text-charcoal/40">Quantity</span>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Button onClick={handleAddToCart} size="lg" fullWidth>
              {added ? 'Added to Cart ✓' : 'Add to Cart'}
            </Button>
            <Button onClick={handleBuyNow} variant="outline" size="lg" fullWidth>
              Buy Now
            </Button>
          </div>

          <AnimatePresence>
            {added && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs text-sage-600 mt-3">
              {quantity} × {product.name} Collection added.{' '}
              <Link href="/cart" className="underline">View Cart</Link>
            </motion.p>
          )}
          </AnimatePresence>
          <p className="text-xs text-charcoal/40 mt-4">🎁 Beautifully packaged and ready to gift.</p>
        </motion.div>
      </Container>

      {/* Smart plant chooser — engine-driven, reflects pet preference + collection */}
      <PlantOptionSelector
        product={product}
        petFriendly={petFriendly}
        onChange={setPetFriendly}
        quizContext={plantCtx}
      />

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-olive py-14 sm:py-16">
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl text-cream mb-8 text-center">
              You May Also Love
            </h2>
            <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Stagger>
          </Container>
        </section>
      )}
      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {showPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setShowPdf(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-charcoal/10 bg-cream/50">
                <div className="flex items-center gap-2.5">
                  <FileText size={18} className="text-olive" />
                  <h3 className="font-serif text-lg text-charcoal">Our Instruction Cards</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/Drift_and_Bloom_Care_Cards_English_Bullets_Left.pdf"
                    download
                    className="text-xs text-olive hover:text-olive-dark underline underline-offset-2 transition-colors"
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={() => setShowPdf(false)}
                    className="p-1.5 rounded-full hover:bg-charcoal/10 text-charcoal/50 hover:text-charcoal transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* PDF embed */}
              <div className="flex-1 bg-gray-100">
                <iframe
                  src="/Drift_and_Bloom_Care_Cards_English_Bullets_Left.pdf"
                  title="Drift & Bloom Instruction Cards"
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
