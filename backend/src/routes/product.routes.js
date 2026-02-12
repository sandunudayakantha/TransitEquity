import express from 'express';
const router = express.Router();
import { getProducts } from '../controllers/product.controller.js';

router.get('/', getProducts);

export default router;
