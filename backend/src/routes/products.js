import { Router } from 'express'
import {
  getProducts, getProductsAdmin, getProduct,
  createProduct, updateProduct, deleteProduct, hardDeleteProduct,
  updateStock, getLowStock
} from '../controllers/productsController.js'
import { adminOnly } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const r = Router()

// Public routes
r.get('/',           getProducts)
r.get('/low-stock',  ...adminOnly, getLowStock)
r.get('/:id',        getProduct)

// Admin routes
r.get('/admin/all',       ...adminOnly, getProductsAdmin)      // all products, any status
r.post('/',               ...adminOnly, upload.single('image'), createProduct)
r.put('/:id',             ...adminOnly, upload.single('image'), updateProduct)
r.patch('/:id/stock',     ...adminOnly, updateStock)
r.delete('/:id',          ...adminOnly, deleteProduct)         // soft delete (archive)
r.delete('/:id/hard',     ...adminOnly, hardDeleteProduct)     // permanent delete

export default r
