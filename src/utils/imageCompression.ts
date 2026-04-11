const MAX_IMAGE_DIMENSION = 1920
const TARGET_IMAGE_BYTES = 1.5 * 1024 * 1024
const MIN_IMAGE_QUALITY = 0.5

type CompressionOptions = {
  maxDimension?: number
  targetBytes?: number
  minQuality?: number
}

export async function compressImageFile(file: File, options: CompressionOptions = {}) {
  if (!file.type.startsWith('image/')) return file
  if (typeof window === 'undefined') return file

  const {
    maxDimension = MAX_IMAGE_DIMENSION,
    targetBytes = TARGET_IMAGE_BYTES,
    minQuality = MIN_IMAGE_QUALITY,
  } = options

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context is not available')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    let quality = 0.9
    let blob = await canvasToBlob(canvas, file.type || 'image/jpeg', quality)
    while (blob.size > targetBytes && quality > minQuality) {
      quality = Math.max(minQuality, +(quality - 0.1).toFixed(2))
      blob = await canvasToBlob(canvas, file.type || 'image/jpeg', quality)
      if (quality === minQuality) break
    }

    if (blob.size >= file.size) return file

    return new File([blob], file.name, { type: blob.type, lastModified: Date.now() })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = (event) => reject(event)
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed'))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}
