import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { productsRouter } from './routes/products.js';
import { authRouter } from './routes/auth.js';
import {ordersRouter} from './routes/orders.js';
import uploadRouter from './routes/upload.js';


dotenv.config();
// 8RTiUSRjHG88z7te

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/products', productsRouter);

app.use('/auth', authRouter)

app.use('/api/orders', ordersRouter);

app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  console.log(process.env.MONGO_URI)
  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
};

start();