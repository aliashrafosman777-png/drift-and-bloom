// @ts-nocheck
const normalizeCollectionName = (name = '') =>
  String(name)
    .trim()
    .replace(/\s+collection$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const collectionImagesByName: Record<string, string> = {
  return: '/assets/return/collection.jpeg',
  growth: '/assets/growth/collection.jpeg',
  stillness: '/assets/stillness/collection.jpeg',
  home: '/assets/home/collection.jpeg',
  grounded: '/assets/grounded/collection.jpeg',
  joy: '/assets/joy/collection.jpeg',
  love: '/assets/love/collection.jpeg',
  dream: '/assets/dream/collection.jpeg',
  renewal: '/assets/renewal/collection.jpeg',
  balance: '/assets/balance/collection.jpeg',
}

export function getCollectionImage(packageName: string, fallbackImage: string) {
  const key = normalizeCollectionName(packageName)
  return collectionImagesByName[key] || fallbackImage
}
