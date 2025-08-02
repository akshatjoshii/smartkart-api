import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
    },

    items: [
        {
            product: {
                _id: String,
                title: String,
                description: String,
                price: Number,
                imageUrl: String,
                category: String,
            },
            qty: Number,
        }
    ],

    total: Number,

    status: {
        type: String,
        enum: ['placed', 'processing', 'shipped', 'in-transit', 'delivered', 'cancelled'],
        default: 'placed'
    },

    createdAt: { type: Date, default: Date.now }
});


export const Order = mongoose.model('Order', orderSchema);
