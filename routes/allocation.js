import express from 'express';
import {
  createAllocation,
  getAllocation,
  updateAllocation,
} from '../controllers/allocation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createAllocation);
router
  .route('/:id')
  .get(protect, getAllocation)
  .post(protect, updateAllocation);
