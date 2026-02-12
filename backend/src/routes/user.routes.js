import express from 'express';
const router = express.Router();
import { getUsers } from '../controllers/user.controller.js';
// import { protect } from '../middlewares/auth.middleware.js';

router.get('/', getUsers);

export default router;
