import { Router } from 'express'
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock, getLowStock } from '../controllers/productsController.js'
import { adminOnly } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
const r = Router()
r.get('/', getProducts)
r.get('/low-stock', ...adminOnly, getLowStock)
r.get('/:id', getProduct)
r.post('/', ...adminOnly, upload.single('image'), createProduct)
r.put('/:id', ...adminOnly, upload.single('image'), updateProduct)
r.patch('/:id/stock', ...adminOnly, updateStock)
r.delete('/:id', ...adminOnly, deleteProduct)
export default r
