import { Router } from 'express';
import {Order} from "../models/Order.js";

import verifyToken from '../middleware/auth.js';
import {requireAdmin, requireAuth} from "../middleware/requiresAuth.js"; // ✅ default import

export const ordersRouter = Router();
// POST /orders → place order
ordersRouter.post('/', verifyToken, async (req, res) => {
    try {
        const { items, customer, total } = req.body;

        if (!items?.length || !customer?.name || !customer?.address) {
            return res.status(400).json({ message: 'Missing customer or item data.' });
        }

        const order = new Order({
            userId: req.user.id,
            customer,
            items: items.map(item => ({
                product: {
                    _id: item.product._id,
                    title: item.product.title,
                    description: item.product.description,
                    price: item.product.price,
                    imageUrl: item.product.imageUrl,
                    category: item.product.category
                },
                qty: item.qty
            })),
            total
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Order creation failed.', error: err.message });
    }
});

// GET /orders → get user's own orders
ordersRouter.get('/', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ userId: req.user.id }),
        ]);

        res.json({
            items: orders,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch orders.', error: err.message });
    }
});
// GET /admin/orders?query=...&page=...&limit=...
ordersRouter.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { query = '', page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const searchRegex = new RegExp(query, 'i')

        const filter = {
            $or: [
                { 'customer.name': searchRegex },
                { 'customer.email': searchRegex }
            ]
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            items: orders,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'Could not fetch admin orders.', error: err.message });
    }
});
// PATCH /orders/:id/status
ordersRouter.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
    const { status } = req.body;

    if (!['placed', 'processing', 'shipped', 'in-transit', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    if (!updated) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updated);
});

