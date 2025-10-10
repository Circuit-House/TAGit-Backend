import express from 'express';
import {
  createRequest,
  updateManagerRequest,
  updateRequest,
  getRequests,
} from '../controllers/purchase.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createRequest);
router
  .route('/:id')
  .put(protect, updateManagerRequest)
  .get(protect, getRequests);

router.put(
  '/request/:id',
  protect,
  authorize('admin', 'purchaser'),
  updateRequest
);

export default router;
