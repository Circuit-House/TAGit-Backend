import express from 'express';
import {
  createAllocation,
  getAllocationById,
  updateAllocation,
  getAllocations,
  getAllocationByAssetId,
  getAllocationByUserId,
} from '../controllers/allocation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createAllocation).get(getAllocations);
router
  .route('/:id')
  .get(protect, getAllocationById)
  .put(protect, updateAllocation);
router.route('/user/:id').get(protect, getAllocationByUserId);
router.route('/asset/:id').get(protect, getAllocationByAssetId);

export default router;
