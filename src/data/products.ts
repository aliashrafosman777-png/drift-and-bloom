// @ts-nocheck
const returnImg = "/assets/return.jpeg";
const returnCollectionImg = "/assets/return/collection.jpeg";
const returnOneImg = "/assets/return/1.jpeg";
const returnTwoImg = "/assets/return/2.jpeg";
const returnThreeImg = "/assets/return/3.jpeg";
const growthImg = "/assets/growth.jpeg";
const growthCollectionImg = "/assets/growth/collection.jpeg";
const growthOneImg = "/assets/growth/1.jpeg";
const growthTwoImg = "/assets/growth/2.jpeg";
const growthThreeImg = "/assets/growth/3.jpeg";
const stillnessImg = "/assets/stillness.jpeg";
const stillnessCollectionImg = "/assets/stillness/collection.jpeg";
const stillnessOneImg = "/assets/stillness/1.jpeg";
const stillnessTwoImg = "/assets/stillness/2.jpeg";
const stillnessThreeImg = "/assets/stillness/3.jpeg";
const homeImg = "/assets/home.jpeg";
const homeCollectionImg = "/assets/home/collection.jpeg";
const homeOneImg = "/assets/home/1.jpeg";
const homeTwoImg = "/assets/home/2.jpeg";
const homeThreeImg = "/assets/home/3.jpeg";
const groundedImg = "/assets/grounded.jpeg";
const groundedCollectionImg = "/assets/grounded/collection.jpeg";
const groundedOneImg = "/assets/grounded/1.jpeg";
const groundedTwoImg = "/assets/grounded/2.jpeg";
const groundedThreeImg = "/assets/grounded/3.jpeg";
const joyImg = "/assets/joy.jpeg";
const joyOneImg = "/assets/joy/1.jpeg";
const joyTwoImg = "/assets/joy/2.jpeg";
const loveImg = "/assets/love.jpeg";
const loveCollectionImg = "/assets/love/collection.jpeg";
const loveOneImg = "/assets/love/1.jpeg";
const loveTwoImg = "/assets/love/2.jpeg";
const loveThreeImg = "/assets/love/3.jpeg";
const dreamImg = "/assets/dream.jpeg";
const dreamCollectionImg = "/assets/dream/collection.jpeg";
const dreamOneImg = "/assets/dream/1.jpeg";
const dreamTwoImg = "/assets/dream/2.jpeg";
const renewalImg = "/assets/renewal.jpeg";
const renewalCollectionImg = "/assets/renewal/collection.jpeg";
const renewalOneImg = "/assets/renewal/1.jpeg";
const renewalTwoImg = "/assets/renewal/2.jpeg";
const renewalThreeImg = "/assets/renewal/3.jpeg";
const balanceImg = "/assets/balance.jpeg";
const balanceCollectionImg = "/assets/balance/collection.jpeg";
const balanceOneImg = "/assets/balance/1.jpeg";
const balanceTwoImg = "/assets/balance/2.jpeg";
const balanceThreeImg = "/assets/balance/3.jpeg";
const plantsImg = "/assets/plants.jpeg";
const candlesImg = "/assets/candles.jpeg";
const fishsImg = "/assets/fishs.jpeg";
const packageImg = "/assets/package.png";
export const BEST_SELLER_CATEGORY_ID = "best-seller";

export const isBestSellerProduct = (product) =>
  Boolean(
    product?.bestSeller ||
      product?.isBestSeller ||
      product?.best_seller ||
      product?.categories?.includes(BEST_SELLER_CATEGORY_ID),
  );

export const packageFilterOptions = [
  { id: BEST_SELLER_CATEGORY_ID, label: "⭐ Best Sellers" },
];

export const categories = [
  { id: "all", label: "All" },
  { id: "best-seller", label: "Best Seller" },
  { id: "calm", label: "Calm" },
  { id: "gifting", label: "Gifting" },
  { id: "love", label: "Love" },
  { id: "self-care", label: "Self-Care" },
  { id: "new-beginnings", label: "New Beginnings" },
];

export const products = [
  {
    id: "return",
    name: "Return",
    tagline: "Come back to what truly matters.",
    description:
      "A gentle invitation to slow down and reconnect with yourself. The Return Collection pairs a hand-potted plant with a softly scented candle and a keepsake story card, made for quiet mornings and long exhales.",
    price: 1250,
    rating: 4.8,
    reviews: 86,
    categories: ["best-seller", "calm"],
    bestSeller: true,
    mood: ["calm", "relaxation"],
    image: returnImg,
    gallery: [returnCollectionImg, returnOneImg, returnTwoImg, returnThreeImg],
    scent: "Sandalwood + Sage",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Spider Plant",
        petFriendly: true,
        note: "Safe for pets, easy to care for. Thrives in indirect light.",
      },
      {
        name: "Golden Pothos",
        petFriendly: false,
        note: "A hardy, trailing plant that adds lush greenery to any space.",
      },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Root deeper. Grow into your best.",
    description:
      "For new beginnings and quiet ambition. The Growth Collection brings a resilient plant, a warm vanilla-bamboo candle, and a handwritten note of encouragement to whoever needs a reminder that they are blooming right on time.",
    price: 1350,
    rating: 4.9,
    reviews: 124,
    categories: ["best-seller", "new-beginnings"],
    bestSeller: true,
    mood: ["motivation", "energy"],
    image: growthImg,
    gallery: [growthCollectionImg, growthOneImg, growthTwoImg, growthThreeImg],
    scent: "Fresh Bamboo",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Snake Plant",
        petFriendly: true,
        note: "Low-maintenance and nearly impossible to kill. Great for beginners.",
      },
      {
        name: "Money Plant",
        petFriendly: false,
        note: "A trailing favorite said to bring good fortune to any room.",
      },
    ],
  },
  {
    id: "stillness",
    name: "Stillness",
    tagline: "A pause that restores your soul.",
    description:
      "Stillness is a calming blend of plants, scents and intentional touches designed to help you create space for peace. Perfect for the over-thinker who needs permission to simply sit and breathe.",
    price: 1250,
    rating: 4.7,
    reviews: 102,
    categories: ["calm", "self-care"],
    mood: ["calm", "comfort"],
    image: stillnessImg,
    gallery: [
      stillnessCollectionImg,
      stillnessOneImg,
      stillnessTwoImg,
      stillnessThreeImg,
    ],
    scent: "Lavender + Chamomile",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Peace Lily",
        petFriendly: true,
        note: "Air-purifying and calming, with elegant white blooms.",
      },
      {
        name: "Lavender Plant",
        petFriendly: false,
        note: "Fragrant and soothing — best kept somewhere sunny.",
      },
    ],
  },
  {
    id: "home",
    name: "Home",
    tagline: "Create a space that feels like you.",
    description:
      "Home is more than a place — it's a feeling. This collection is a gentle reminder of comfort, safety and the little things that make a space your own. Thoughtfully curated to help you or someone you love feel grounded, nurtured and at home.",
    price: 1350,
    rating: 4.9,
    reviews: 158,
    categories: ["best-seller", "gifting"],
    bestSeller: true,
    mood: ["comfort", "balance"],
    image: homeImg,
    gallery: [
      homeCollectionImg,
      homeOneImg,
      homeTwoImg,
      homeThreeImg,
    ],
    scent: "Vanilla + Cotton",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Spider Plant",
        petFriendly: true,
        note: "Safe for pets and easy to care for. Thrives in indirect light.",
      },
      {
        name: "Golden Pothos",
        petFriendly: false,
        note: "A hardy, trailing plant that adds lush greenery to any space.",
      },
    ],
  },
  {
    id: "grounded",
    name: "Grounded",
    tagline: "Stay present. Root into peace.",
    description:
      "Grounded brings together earthy textures and calming scents for anyone who needs to feel steady again. A small ritual to help you plant your feet and breathe through the noise.",
    price: 1250,
    rating: 4.6,
    reviews: 64,
    categories: ["calm", "self-care"],
    mood: ["balance", "comfort"],
    image: groundedImg,
    gallery: [
      groundedCollectionImg,
      groundedOneImg,
      groundedTwoImg,
      groundedThreeImg,
    ],
    scent: "Cedarwood + Moss",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "ZZ Plant",
        petFriendly: false,
        note: "Practically indestructible and thrives on neglect.",
      },
      {
        name: "Areca Palm",
        petFriendly: true,
        note: "Pet-safe and brings a soft, tropical feel to any room.",
      },
    ],
  },
  {
    id: "joy",
    name: "Joy",
    tagline: "Little moments, endless light.",
    description:
      "Joy is for celebrating the small stuff — a promotion, a Tuesday, a good cup of coffee. Bright, warm and a little playful, it's built to make someone smile the second they open the box.",
    price: 1350,
    rating: 4.8,
    reviews: 97,
    categories: ["gifting", "best-seller"],
    bestSeller: true,
    mood: ["energy", "motivation"],
    image: joyImg,
    gallery: [joyOneImg, joyTwoImg],
    scent: "Citrus + Honey",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Calathea",
        petFriendly: true,
        note: "Playful patterned leaves that fold up at night.",
      },
      {
        name: "Pothos Marble Queen",
        petFriendly: false,
        note: "Variegated and easy-going, brightens any corner.",
      },
    ],
  },
  {
    id: "love",
    name: "Love",
    tagline: "Give love. Feel love. Be love.",
    description:
      "A soft, romantic collection for partners, friends or yourself. Love pairs a delicate plant with a warm candle and a heartfelt note — the perfect way to say what words sometimes can't.",
    price: 1450,
    rating: 4.9,
    reviews: 211,
    categories: ["love", "gifting", "best-seller"],
    bestSeller: true,
    mood: ["comfort", "calm"],
    image: loveImg,
    gallery: [loveCollectionImg, loveOneImg, loveTwoImg, loveThreeImg],
    scent: "Rose + Amber",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Anthurium",
        petFriendly: false,
        note: "Heart-shaped blooms that last for weeks.",
      },
      {
        name: "String of Hearts",
        petFriendly: true,
        note: "A delicate, trailing vine with tiny heart-shaped leaves.",
      },
    ],
  },
  {
    id: "dream",
    name: "Dream",
    tagline: "Nourish your dreams. Trust the night.",
    description:
      "Dream is built for wind-down rituals — soft light, soothing scent and a plant that thrives in low light, just like you do at the end of a long day.",
    price: 1250,
    rating: 4.7,
    reviews: 73,
    categories: ["calm", "self-care"],
    mood: ["calm", "comfort"],
    image: dreamImg,
    gallery: [dreamCollectionImg, dreamOneImg, dreamTwoImg],
    scent: "Lavender + Night Jasmine",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Snake Plant",
        petFriendly: true,
        note: "Releases oxygen at night — a gentle bedroom companion.",
      },
      {
        name: "ZZ Plant",
        petFriendly: false,
        note: "Thrives in low light and asks for almost nothing.",
      },
    ],
  },
  {
    id: "renewal",
    name: "Renewal",
    tagline: "New energy. Fresh beginnings.",
    description:
      "Renewal is a clean slate in a box. Crisp scents and a hardy young plant make this the go-to gift for new homes, new jobs, and new chapters of any kind.",
    price: 1350,
    rating: 4.6,
    reviews: 58,
    categories: ["new-beginnings", "gifting"],
    mood: ["motivation", "energy"],
    image: renewalImg,
    gallery: [
      renewalCollectionImg,
      renewalOneImg,
      renewalTwoImg,
      renewalThreeImg,
    ],
    scent: "Eucalyptus + Mint",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Pothos",
        petFriendly: false,
        note: "Fast-growing and forgiving — perfect for a fresh start.",
      },
      {
        name: "Spider Plant",
        petFriendly: true,
        note: "Resilient and pet-friendly, easy to keep alive anywhere.",
      },
    ],
  },
  {
    id: "balance",
    name: "Balance",
    tagline: "Find harmony in everyday.",
    description:
      'Balance brings structure and softness together — an easy-care plant, a grounding candle scent, and a note to remind you that "enough" is a place you can return to.',
    price: 1250,
    rating: 4.8,
    reviews: 91,
    categories: ["calm", "self-care", "best-seller"],
    bestSeller: true,
    mood: ["balance", "comfort"],
    image: balanceImg,
    gallery: [
      balanceCollectionImg,
      balanceOneImg,
      balanceTwoImg,
      balanceThreeImg,
    ],
    scent: "Sandalwood + Bergamot",
    includes: [
      "Live Plant",
      "Scented Candle",
      "Story Card",
      "Themed Packaging",
    ],
    plantOptions: [
      {
        name: "Peace Lily",
        petFriendly: true,
        note: "Calming, air-purifying, and forgiving of inconsistent watering.",
      },
      {
        name: "Rubber Plant",
        petFriendly: false,
        note: "Glossy leaves and a strong, upright shape for any room.",
      },
    ],
  },
];

export const heroCategories = [
  {
    id: "plants",
    label: "Plants",
    image: plantsImg,
    description: "Easy-care greenery for every space",
  },
  {
    id: "candles",
    label: "Candles",
    image: candlesImg,
    description: "Hand-poured, softly scented",
  },
  {
    id: "gifts",
    label: "Gifts",
    image: packageImg,
    description: "Thoughtful packages, beautifully boxed",
  },
  {
    id: "self-care",
    label: "Self Care",
    image: balanceImg,
    description: "Small rituals for slowing down",
  },
];

export const getProductById = (id) => products.find((p) => p.id === id);

export const getRelatedProducts = (id, count = 5) =>
  products.filter((p) => p.id !== id).slice(0, count);

export const getBestSellers = () => products.filter(isBestSellerProduct);

export default products;

// Build Your Package catalog
// Grouped by category for the package builder page. These are placeholder
// products with on-brand neutral imagery and can be swapped for real SKUs later.
export const buildPackageCategories = [
  {
    id: "plants",
    label: "Plants",
    singular: "plant",
    emoji: "🌿",
    image: plantsImg,
    description: "Easy-care greenery for every space.",
  },
  {
    id: "candles",
    label: "Candles",
    singular: "candle",
    emoji: "🕯️",
    image: candlesImg,
    description: "Hand-poured candles with relaxing scents.",
  },
  {
    id: "fish",
    label: "Fish",
    singular: "fish package",
    emoji: "🐠",
    image: fishsImg,
    description: "Beautiful Betta fish and aquarium essentials.",
  },
];

export const packageBuilderProducts = [
  {
    id: "candle-lavender",
    name: "Lavender Candle",
    price: 650,
    description:
      "A hand-poured lavender candle made for quiet evenings, soft light, and a calmer room rhythm.",
    shortDescription: "Calming lavender for evening rituals.",
    image: candlesImg,
    category: "candles",
    story:
      "Lavender Candle was created for the moment the room finally becomes yours again. Light it when the day has been too loud and let the scent turn your space into a softer place to land.",
    tags: ["Floral", "Relaxing", "Handmade"],
  },
  {
    id: "candle-vanilla",
    name: "Vanilla Candle",
    price: 620,
    description:
      "Warm vanilla, soft cream, and a gentle amber base that makes the whole package feel comforting.",
    shortDescription: "Soft vanilla warmth with a creamy finish.",
    image: candlesImg,
    category: "candles",
    story:
      "Vanilla Candle is made for slow mornings, handwritten notes, and homes that feel tender without trying too hard.",
    tags: ["Warm", "Cozy", "Soft"],
  },
  {
    id: "candle-ocean-breeze",
    name: "Ocean Breeze Candle",
    price: 680,
    description:
      "A clean coastal candle with sea air, white woods, and a fresh mineral finish.",
    shortDescription: "Fresh coastal air for bright spaces.",
    image: candlesImg,
    category: "candles",
    story:
      "Ocean Breeze was blended for open windows, clear thoughts, and the feeling of breathing a little deeper.",
    tags: ["Fresh", "Clean", "Refreshing"],
  },
  {
    id: "plant-snake",
    name: "Snake Plant",
    price: 420,
    description:
      "A sculptural, low-maintenance plant with strong upright leaves and a calm architectural presence.",
    shortDescription: "Low-maintenance structure for calm corners.",
    image: plantsImg,
    category: "plants",
    story:
      "Snake Plant is the steady friend of the package — resilient, elegant, and happy with simple care.",
    tags: ["Easy Care", "Airy", "Minimal"],
  },
  {
    id: "plant-monstera",
    name: "Monstera",
    price: 760,
    description:
      "A bold botanical statement with generous leaves that brings a lush, premium feeling to the package.",
    shortDescription: "Lush statement leaves with tropical energy.",
    image: plantsImg,
    category: "plants",
    story:
      "Monstera was chosen for people who want their space to feel alive, expressive, and beautifully growing.",
    tags: ["Botanical", "Statement", "Lush"],
  },
  {
    id: "plant-peace-lily",
    name: "Peace Lily",
    price: 540,
    description:
      "A graceful plant with glossy leaves and white blooms that adds softness and quiet balance.",
    shortDescription: "Soft white blooms for peaceful rooms.",
    image: plantsImg,
    category: "plants",
    story:
      "Peace Lily brings a quiet kind of beauty — simple, gentle, and made for rooms that need softness.",
    tags: ["Floral", "Elegant", "Calm"],
  },
  {
    id: "tank-mini-aquarium",
    name: "Mini Aquarium",
    price: 950,
    description:
      "A compact premium fish tank with a soft botanical setup, ideal for desks, shelves, and small rituals.",
    shortDescription: "Compact aquarium for refined small spaces.",
    image: fishsImg,
    category: "fish",
    story:
      "Mini Aquarium is a tiny world of movement and stillness, designed to make even a small corner feel considered.",
    tags: ["Compact", "Calm", "Desk Friendly"],
  },
  {
    id: "tank-medium-aquarium",
    name: "Medium Aquarium",
    price: 1450,
    description:
      "A balanced mid-size aquarium with sand, greenery, and enough presence to anchor a beautiful room corner.",
    shortDescription: "Balanced size with a calm botanical scene.",
    image: fishsImg,
    category: "fish",
    story:
      "Medium Aquarium is for the person who wants a living centerpiece — calm, expressive, and never loud.",
    tags: ["Balanced", "Botanical", "Premium"],
  },
  {
    id: "tank-premium-aquarium",
    name: "Premium Aquarium",
    price: 2200,
    description:
      "A larger luxury aquarium concept with layered greenery, soft sand, and a refined centerpiece feeling.",
    shortDescription: "A premium living centerpiece for gifting.",
    image: fishsImg,
    category: "fish",
    story:
      "Premium Aquarium turns the package into a full visual ritual — a quiet underwater garden made to be remembered.",
    tags: ["Luxury", "Statement", "Gift Ready"],
  },
];

export const packageBuilderProductsByCategory = buildPackageCategories.reduce(
  (groups, category) => {
    groups[category.id] = packageBuilderProducts.filter(
      (product) => product.category === category.id,
    );
    return groups;
  },
  {},
);
