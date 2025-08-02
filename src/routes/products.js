import { Router } from 'express';
import { Product } from '../models/Product.js';
import {requireAdmin, requireAuth} from "../middleware/requiresAuth.js";

export const productsRouter = Router();

// GET /products — list all products
productsRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;   // default page = 1
  const limit = parseInt(req.query.limit) || 10; // default limit = 10
  const skip = (page - 1) * limit;
  const q = req.query.q;
  const query = q?.trim()
      ? {
        $or: [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { category: new RegExp(q, 'i') },
        ]
      }
      : {};

  try {
    const total = await Product.countDocuments();
    const items = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// POST /products — create (temporary open for MVP; later restrict to admin)
productsRouter.post('/', async (req, res) => {
  try {
    const doc = await Product.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// POST /products — Admin only
productsRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const doc = await Product.create(req.body);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
// GET by ID
productsRouter.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
// Optionally: Add PUT /products/:id and DELETE /products/:id for admin
productsRouter.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

productsRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});