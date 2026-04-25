import { Router } from 'express'
import { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoriesController.js'
import { adminSecret } from '../middleware/auth.js'
const r = Router()

r.get('/',        getCategories)                    // public — frontend
r.get('/all',     adminSecret, getAllCategories)    // admin — includes inactive
r.post('/',       adminSecret, createCategory)
r.put('/:id',     adminSecret, updateCategory)
r.delete('/:id',  adminSecret, deleteCategory)

export default r
