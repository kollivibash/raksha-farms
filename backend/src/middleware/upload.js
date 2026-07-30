import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

// ─────────────────────────────────────────────────────────────────────────────
// Product image uploads.
//
// Two modes, picked automatically:
//
//   Cloudinary (production) — when CLOUDINARY_URL is set. Files are held in
//     memory and streamed straight to Cloudinary, which returns a permanent
//     https URL. Nothing touches the container's filesystem, so images survive
//     restarts and redeploys.
//
//   Local disk (development) — when it isn't. Same behaviour as before:
//     files land in ./uploads and are served by express.static at /uploads.
//
// The old disk-only setup silently lost every uploaded image whenever the host
// recycled the container, because free/ephemeral hosts give you no persistent
// volume. Cloudinary removes that failure mode entirely.
// ─────────────────────────────────────────────────────────────────────────────

// The Cloudinary SDK parses CLOUDINARY_URL at *import* time and throws if it is
// malformed — which would take the whole server down over a mistyped image
// credential. So validate the shape first and only import when it is sane.
// A broken image config must degrade to local storage, never crash the API.
const rawCloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim().replace(/^["']|["']$/g, '')
const CLOUDINARY_RE = /^cloudinary:\/\/[^:@/]+:[^:@/]+@[^:@/]+$/

let cloudinary = null
export const useCloudinary = CLOUDINARY_RE.test(rawCloudinaryUrl)

if (useCloudinary) {
  process.env.CLOUDINARY_URL = rawCloudinaryUrl   // normalised (quotes/space stripped)
  ;({ v2: cloudinary } = await import('cloudinary'))
  cloudinary.config({ secure: true })
  console.log('🖼  Image uploads → Cloudinary')
} else if (rawCloudinaryUrl) {
  console.warn('⚠  CLOUDINARY_URL is set but malformed — ignoring it and using local ./uploads.')
  console.warn('   Expected exactly: cloudinary://<api_key>:<api_secret>@<cloud_name>')
  console.warn(`   Got ${rawCloudinaryUrl.length} chars starting "${rawCloudinaryUrl.slice(0, 14)}…"`)
} else {
  console.log('🖼  Image uploads → local ./uploads (set CLOUDINARY_URL for persistent storage)')
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

if (!useCloudinary) {
  // Only needed for the local-disk path. Wrapped so a read-only or missing
  // directory never crashes boot — uploads just fail gracefully instead.
  try {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  } catch (err) {
    console.warn(`⚠ Could not create upload dir "${UPLOAD_DIR}": ${err.message}`)
  }
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Only image files allowed'), false)
}

export const upload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
})

// Stream one in-memory file to Cloudinary. Resolves to the permanent https URL.
function uploadBufferToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'raksha-farms/products', public_id: uuidv4(), resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    )
    stream.end(file.buffer)
  })
}

// Runs after multer. Gives every file a `.url` the controllers can use,
// whichever storage mode is active, so the controllers stay storage-agnostic.
async function attachUrls(req, res, next) {
  const files = Array.isArray(req.files)
    ? req.files
    : req.files && typeof req.files === 'object'
      ? Object.values(req.files).flat()
      : req.file ? [req.file] : []

  if (files.length === 0) return next()

  try {
    if (useCloudinary) {
      await Promise.all(files.map(async f => { f.url = await uploadBufferToCloudinary(f) }))
    } else {
      for (const f of files) f.url = `/uploads/${f.filename}`
    }
    next()
  } catch (err) {
    console.error('Image upload failed:', err.message)
    // Don't fail the whole request — the product still saves, just without the
    // new image, which matches how the old disk path degraded.
    for (const f of files) if (!f.url) f.url = undefined
    next()
  }
}

// Use upload.any() so multer never throws "unexpected field" regardless of
// what field names the client sends. The controller filters by fieldname.
// Accepts up to 11 files total (1 cover + 10 gallery).
export const uploadProductImages = [upload.any(), attachUrls]
