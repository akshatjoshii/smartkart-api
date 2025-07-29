import { Router } from 'express';
import { Product } from '../models/Product.js';

export const productsRouter = Router();

// GET /products — list all products
productsRouter.get('/', async (_req, res) => {
  const items = await Product.find().limit(50).sort({ createdAt: -1 });
  res.json(items);
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