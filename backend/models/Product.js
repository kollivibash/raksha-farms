const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['vegetables', 'fruits', 'groceries'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'litre', 'bunch', 'dozen', 'piece', 'pack'],
      default: 'kg',
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    emoji: {
      type: String,
      default: '🌿',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster category queries
productSchema.index({ category: 1, active: 1 })
productSchema.index({ featured: 1 })

module.exports = mongoose.model('Product', productSchema)
