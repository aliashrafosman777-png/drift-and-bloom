import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RotateCcw, ShoppingBag, Leaf, Flame, Gift, Sparkles, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductContext'
import { useToast } from '../../components/common/Toast'
import OptimizedImage from '../../components/common/OptimizedImage'

export default function ResultCard({ result, onRetake }) {
  const { main, secondary, isBlended, plant, isPetSafe } = result

  const { addToCart } = useCart()
  const { getProductById } = useProducts()
  const { showToast } = useToast()
  const router = useRouter()

  const recommendedProducts = useMemo(() => {
    const list = []
    if (main?.id) {
      const p = getProductById(main.id)
      if (p) list.push(p)
    }
    if (isBlended && secondary?.id) {
      const p = getProductById(secondary.id)
      if (p) list.push(p)
    }
    return list
  }, [main, secondary, isBlended, getProductById])

  const handleAddToCart = (product) => {
    const defaultPlant = product.plantOptions?.[0]?.name || null
    addToCart(product, 1, defaultPlant)
    showToast(`Added The ${product.name} Collection to your cart!`, 'success')
  }

  const handleBuyNow = (product) => {
    const defaultPlant = product.plantOptions?.[0]?.name || null
    addToCart(product, 1, defaultPlant)
    router.push('/cart')
  }

  if (!main) return null

  const [p1, p2, p3] = main.palette || ['#E9EDC9', '#CCD5AE', '#B7B7A4']

  return (
    <div className="animate-scale-in w-full max-w-3xl mx-auto">

      {/* ── Soul Identity ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-lift mb-6"
        style={{
          background: `linear-gradient(135deg, ${p1}99 0%, ${p2}88 50%, ${p3}70 100%)`,
        }}
      >
        {/* Decorative bokeh blobs */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: p1 }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-25 blur-2xl"
          style={{ backgroundColor: p3 }}
        />

        <div className="relative px-8 sm:px-14 py-12 text-center">
          <p className="text-xs uppercase tracking-label text-charcoal/50 mb-2 font-medium">
            Your Soul is:
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl text-charcoal mb-1">
            {main.name}
          </h1>

          {isBlended && secondary && (
            <p className="text-base text-charcoal/60 mt-2 font-serif italic">
              with a soft touch of{' '}
              <span className="text-charcoal/80 font-semibold">{secondary.name}</span>
            </p>
          )}

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-3 my-5">
            <span className="flex-1 max-w-[80px] h-px bg-gold/40" />
            <span className="w-1.5 h-1.5 rotate-45 bg-gold shrink-0" />
            <span className="flex-1 max-w-[80px] h-px bg-gold/40" />
          </div>

          <p className="text-sm sm:text-base text-charcoal/70 max-w-md mx-auto leading-relaxed italic font-serif">
            "{main.feeling}"
          </p>

          <p className="text-sm text-charcoal/60 max-w-xl mx-auto leading-relaxed mt-4">
            {main.description}
          </p>

          {/* Mood badge */}
          <span className="inline-block mt-5 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-xs text-charcoal/60 font-medium border border-white/40">
            {main.mood}
          </span>
        </div>
      </div>

      {/* ── Recommended Package ───────────────────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-card p-7 sm:p-9 mb-5">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-olive/10 text-olive flex items-center justify-center">
            <ShoppingBag size={16} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-xl text-charcoal">{main.packageName}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Plant */}
          <div className="bg-sage-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center">
                <Leaf size={14} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] uppercase tracking-label text-charcoal/45 font-medium">
                Recommended Plant
              </p>
            </div>
            <p className="text-sm text-charcoal font-medium leading-snug">{plant}</p>
            {isPetSafe && (
              <span className="inline-block mt-2 text-[10px] bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">
                🐾 Pet-Safe
              </span>
            )}
          </div>

          {/* Candle */}
          <div className="bg-[#FFF8F0] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brown/10 text-brown-dark flex items-center justify-center">
                <Flame size={14} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] uppercase tracking-label text-charcoal/45 font-medium">
                Candle Scent
              </p>
            </div>
            <p className="text-sm text-charcoal font-medium leading-snug">{main.candle}</p>
          </div>

          {/* Add-on */}
          <div className="bg-[#FAF5F0] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-beige-dark text-charcoal/50 flex items-center justify-center">
                <Gift size={14} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] uppercase tracking-label text-charcoal/45 font-medium">
                Add-On Touch
              </p>
            </div>
            <p className="text-sm text-charcoal font-medium leading-snug">{main.addOn}</p>
          </div>
        </div>

        {/* Inspirational line */}
        <div className="mt-6 flex items-start gap-3 bg-beige/60 rounded-2xl p-4">
          <Sparkles size={16} className="text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm text-charcoal/70 italic font-serif">{main.shortLine}</p>
        </div>
      </div>

      {/* ── Blended Secondary ─────────────────────────────────────────────── */}
      {isBlended && secondary && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-soft p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={15} className="text-brown" strokeWidth={1.5} />
            <p className="text-sm font-medium text-charcoal">
              With a Soft Touch of{' '}
              <span className="font-serif italic">{secondary.name}</span>
            </p>
          </div>
          <p className="text-sm text-charcoal/60 leading-relaxed">{secondary.description}</p>
          <p className="text-xs text-charcoal/40 italic mt-2">{secondary.shortLine}</p>
        </div>
      )}

      {/* ── CTA row ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <Link
          href={`/packages/${main.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-olive hover:bg-olive-dark
            text-cream text-sm font-medium uppercase tracking-label px-6 py-4 rounded-full
            transition duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lift w-full sm:w-auto"
        >
          <ShoppingBag size={15} /> View {main.name} Package
        </Link>
        <Link
          href="/packages"
          className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-olive
            text-olive text-sm font-medium uppercase tracking-label px-6 py-4 rounded-full
            transition duration-300 hover:bg-olive hover:text-cream w-full sm:w-auto"
        >
          Browse All Packages
        </Link>
        <button
          type="button"
          onClick={onRetake}
          className="flex items-center gap-1.5 text-xs text-charcoal/45 hover:text-olive
            transition duration-200 underline underline-offset-2 mt-1 sm:mt-0"
        >
          <RotateCcw size={12} /> Play Again (Reset Progress)
        </button>
      </div>

      {/* ── Recommended Products Section ─────────────────────────────────── */}
      {recommendedProducts.length > 0 && (
        <div className="mt-12 pt-10 border-t border-charcoal/10">
          <div className="text-center mb-8">
            <span className="text-gold-dark text-xs uppercase tracking-label font-semibold">
              Tailored for Your Soul
            </span>
            <h2 className="font-serif text-3xl text-charcoal mt-1">
              Your Recommended {recommendedProducts.length > 1 ? 'Packages' : 'Package'}
            </h2>
            <p className="text-sm text-charcoal/60 mt-2 max-w-md mx-auto">
              {recommendedProducts.length > 1 
                ? "Since your soul is a blend of two energies, we recommend combining these collections for complete harmony." 
                : "This collection was handpicked to nourish your current emotional needs and restore balance."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {recommendedProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/60 shadow-card hover:shadow-lift transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.bestSeller && (
                    <span className="absolute top-4 left-4 bg-gold text-charcoal-dark font-medium text-[10px] tracking-label uppercase px-2.5 py-1 rounded-full shadow-sm">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="font-serif text-2xl text-charcoal group-hover:text-olive transition-colors duration-300">
                        The {product.name} Collection
                      </h3>
                      {product.tagline && (
                        <p className="text-xs italic text-charcoal/50 font-serif mt-0.5">
                          "{product.tagline}"
                        </p>
                      )}
                    </div>
                    <span className="font-serif text-2xl text-brown shrink-0">
                      LE {product.price.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-charcoal/60 leading-relaxed mb-6 flex-1">
                    {product.shortDescription || product.description}
                  </p>

                  {/* Scent & Includes badges */}
                  {product.scent && (
                    <div className="mb-6 flex flex-wrap gap-2">
                      <span className="inline-block text-[10px] bg-beige text-charcoal/60 px-3 py-1 rounded-full border border-charcoal/5 font-medium">
                        ✨ Scent: {product.scent}
                      </span>
                      {product.plantOptions?.[0] && (
                        <span className="inline-block text-[10px] bg-sage-50 text-sage-700 px-3 py-1 rounded-full border border-sage-100 font-medium">
                          🌿 Default Plant: {product.plantOptions[0].name}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-transparent border border-olive text-olive hover:bg-olive/5
                        text-xs font-semibold uppercase tracking-label py-3.5 rounded-full
                        transition duration-300 active:scale-[0.98]"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 bg-olive hover:bg-olive-dark text-cream
                        text-xs font-semibold uppercase tracking-label py-3.5 rounded-full
                        transition duration-300 shadow-sm hover:shadow-lift active:scale-[0.98]"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
