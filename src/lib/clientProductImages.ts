'use client'

import { apiFetch } from '@/lib/api'

export type ProductImageInput = {
  id?: string | number
  file?: File
  preview?: string
  url?: string
  publicId?: string
}

export type PersistedProductImages = {
  urls: string[]
  publicIds: string[]
  uploadedPublicIds: string[]
}

export async function cleanupUploadedProductImages(publicIds: string[]) {
  await Promise.allSettled(publicIds.map((publicId) => apiFetch(
    `/api/upload?publicId=${encodeURIComponent(publicId)}`,
    { method: 'DELETE', cache: 'no-store' },
  )))
}

export async function persistProductImages(
  images: ProductImageInput[],
): Promise<PersistedProductImages> {
  const persisted: Array<{ url: string; publicId: string }> = []
  const uploadedPublicIds: string[] = []

  try {
    // Keep URL and storage identifiers aligned. Sequential uploads preserve the
    // administrator's chosen main/gallery order and make compensation reliable.
    for (const image of images || []) {
      if (image.file instanceof File) {
        const body = new FormData()
        body.append('file', image.file)
        const response = await apiFetch<{ url: string; publicId: string }>('/api/upload', {
          method: 'POST',
          cache: 'no-store',
          body,
        })
        persisted.push({ url: response.data.url, publicId: response.data.publicId })
        uploadedPublicIds.push(response.data.publicId)
        continue
      }

      const url = image.url || image.preview
      if (typeof url !== 'string' || !url || /^data:/i.test(url)) {
        throw new Error('An image could not be saved to durable storage. Please select it again.')
      }
      persisted.push({ url, publicId: image.publicId || '' })
    }
  } catch (error) {
    await cleanupUploadedProductImages(uploadedPublicIds)
    throw error
  }

  return {
    urls: persisted.map((item) => item.url),
    publicIds: persisted.map((item) => item.publicId),
    uploadedPublicIds,
  }
}
