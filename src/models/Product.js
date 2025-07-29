import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: 'general' },
    stock: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);