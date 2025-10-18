import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/async.js';
import Allocation from '../models/Allocation.js';
import Asset from '../models/Asset.js';
import mongoose from 'mongoose';

const allocationPopulate = [
  { path: 'allocatedBy', select: 'name email role' },
  { path: 'allocatedTo', select: 'name email role' },
  {
    path: 'asset',
    select: 'name serialNumber owner purchaser assetImageUrl invoiceUrl',
    populate: [
      { path: 'owner', select: 'name email role' },
      { path: 'purchaser', select: 'name email role' },
    ],
  },
];

/**
 * Helper to validate ObjectId
 */
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * @desc    Create Allocation
 * @route   POST /api/v1/allocation
 * @access  Private
 */
export const createAllocation = asyncHandler(async (req, res, next) => {
  // req.body should contain allocatedBy, allocatedTo, asset, allocationType, etc.
  const create = await Allocation.create(req.body);

  // Do NOT auto-change asset owner on create. Approval should control owner change.
  // If you prefer automatic owner change on create when allocationType==='Owner' and requestStatus===true,
  // you can add logic here (but this file follows approve/reject flow).

  const populated = await Allocation.findById(create._id).populate(
    allocationPopulate
  );

  res.status(201).json({
    success: true,
    data: populated,
  });
});

/**
 * @desc    Get All Allocations
 * @route   GET /api/v1/allocation
 * @access  Private
 */
export const getAllocations = asyncHandler(async (req, res, next) => {
  const allocations = await Allocation.find().populate(allocationPopulate);
  res.status(200).json({
    success: true,
    data: allocations,
  });
});

/**
 * @desc    Get Allocation By id
 * @route   GET /api/v1/allocation/:id
 * @access  Private
 */
export const getAllocationById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!isValidId(id))
    return next(new ErrorResponse(`Invalid allocation id ${id}`, 400));

  const allocation = await Allocation.findById(id).populate(allocationPopulate);
  if (!allocation)
    return next(new ErrorResponse(`Allocation not found with id ${id}`, 404));

  res.status(200).json({
    success: true,
    data: allocation,
  });
});

/**
 * @desc    Get Allocations By User id (allocatedTo OR allocatedBy)
 * @route   GET /api/v1/allocation/user/:id
 * @access  Private
 */
export const getAllocationByUserId = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  if (!isValidId(userId))
    return next(new ErrorResponse(`Invalid user id ${userId}`, 400));

  const allocations = await Allocation.find({
    $or: [{ allocatedTo: userId }, { allocatedBy: userId }],
  }).populate(allocationPopulate);

  res.status(200).json({
    success: true,
    data: allocations,
  });
});

/**
 * @desc    Get Allocations By Asset id
 * @route   GET /api/v1/allocation/asset/:id
 * @access  Private
 */
export const getAllocationByAssetId = asyncHandler(async (req, res, next) => {
  const assetId = req.params.id;
  if (!isValidId(assetId))
    return next(new ErrorResponse(`Invalid asset id ${assetId}`, 400));

  const allocations = await Allocation.find({ asset: assetId }).populate(
    allocationPopulate
  );
  res.status(200).json({
    success: true,
    data: allocations,
  });
});

/**
 * @desc    Generic Update Allocation (does NOT change Asset owner)
 * @route   PUT /api/v1/allocation/:id
 * @access  Private
 */
export const updateAllocation = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!isValidId(id))
    return next(new ErrorResponse(`Invalid allocation id ${id}`, 400));

  const updated = await Allocation.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated)
    return next(new ErrorResponse(`Allocation not found with id ${id}`, 404));

  // Return populated allocation (no owner mutation here)
  const populated = await Allocation.findById(updated._id).populate(
    allocationPopulate
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});

/**
 * @desc    Approve Allocation (accept request).
 *          If allocationType === 'Owner' -> update Asset.owner = allocatedTo
 * @route   PUT /api/v1/allocation/:id/approve
 * @access  Private
 */
export const approveAllocation = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!isValidId(id))
    return next(new ErrorResponse(`Invalid allocation id ${id}`, 400));

  const allocation = await Allocation.findById(id);
  if (!allocation)
    return next(new ErrorResponse(`Allocation not found with id ${id}`, 404));

  // set approved fields
  allocation.requestStatus = true;
  allocation.status = 'approved';
  allocation.allocationStatusDate = new Date();

  // record who approved if available in req.user
  if (req.user && req.user.id) allocation.approvedBy = req.user.id;

  await allocation.save();

  // If this is an Owner allocation, change the asset owner
  if (allocation.allocationType === 'Owner' && allocation.allocatedTo) {
    // Only update asset owner if it's different
    const asset = await Asset.findById(allocation.asset);
    if (asset) {
      if (
        !asset.owner ||
        asset.owner.toString() !== allocation.allocatedTo.toString()
      ) {
        asset.owner = allocation.allocatedTo;
        await asset.save();
      }
    }
  }

  const populated = await Allocation.findById(allocation._id).populate(
    allocationPopulate
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});

/**
 * @desc    Reject Allocation (decline request).
 *          Does NOT change Asset.owner. Sets requestStatus = false and saves reason.
 * @route   PUT /api/v1/allocation/:id/reject
 * @access  Private
 *
 * Accepts optional body: { rejectionReason: "reason text" }
 */
export const rejectAllocation = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!isValidId(id))
    return next(new ErrorResponse(`Invalid allocation id ${id}`, 400));

  const allocation = await Allocation.findById(id);
  if (!allocation)
    return next(new ErrorResponse(`Allocation not found with id ${id}`, 404));

  allocation.requestStatus = false;
  allocation.status = 'rejected';
  allocation.rejectionReason =
    req.body.rejectionReason || req.body.reason || 'Rejected';
  allocation.allocationStatusDate = new Date();

  // Optionally record who rejected (req.user)
  if (req.user && req.user.id) allocation.rejectedBy = req.user.id; // note: if you want this, add field to model

  await allocation.save();

  const populated = await Allocation.findById(allocation._id).populate(
    allocationPopulate
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});
