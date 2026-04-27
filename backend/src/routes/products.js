import { Router } from 'express'
import {
  getProducts, getProductsAdmin, getProduct,
  createProduct, updateProduct, deleteProduct, hardDeleteProduct,
  updateStock, getLowStock
} from '../controllers/productsController.js'
import { adminOnly } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const r = Router()

// Static/named routes MUST come before /:id to avoid being swallowed as a param
r.get('/',                getProducts)
r.get('/low-stock',       ...adminOnly, getLowStock)
r.get('/admin/all',       ...adminOnly, getProductsAdmin)      // all products, any status

// Param routes — after all named routes
r.get('/:id',             getProduct)
r.post('/',               ...adminOnly, upload.single('image'), createProduct)
r.put('/:id',             ...adminOnly, upload.single('image'), updateProduct)
r.patch('/:id/stock',     ...adminOnly, updateStock)
r.delete('/:id',          ...adminOnly, deleteProduct)         // soft delete (archive)
r.delete('/:id/hard',     ...adminOnly, hardDeleteProduct)     // permanent delete

export default r
