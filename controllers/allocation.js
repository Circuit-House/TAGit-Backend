import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/async.js';
import Allocation from '../models/Allocation.js';
import Asset from '../models/Asset.js';

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

//  @desc   Create Allocation
//  @route  POST /api/v1/allocation
//  @access  Private
export const createAllocation = asyncHandler(async (req, res, next) => {
  const create = await Allocation.create(req.body);
  await create.populate(allocationPopulate);
  res.status(200).json({
    success: true,
    data: create,
  });
});

//  @desc   Get Allocations
//  @route  GET /api/v1/allocation
//  @access  Private
export const getAllocations = asyncHandler(async (req, res, next) => {
  const allocations = await Allocation.find().populate(allocationPopulate);
  res.status(200).json({
    success: true,
    data: allocations,
  });
});

//  @desc   Get Allocation By id
//  @route  GET /api/v1/allocation
//  @access  Private
export const getAllocationById = asyncHandler(async (req, res, next) => {
  const allocations = await Allocation.findById(req.params.id).populate(
    allocationPopulate
  );
  res.status(200).json({
    success: true,
    data: allocations,
  });
});

//  @desc   Get Allocation By User id
//  @route  GET /api/v1/allocation
//  @access  Private
export const getAllocationByUserId = asyncHandler(async (req, res, next) => {
  let userId = req.params.id;
  const allocations = await Allocation.find({
    $or: [{ allocatedTo: userId }, { allocatedBy: userId }],
  }).populate(allocationPopulate);
  res.status(200).json({
    success: true,
    data: allocations,
  });
});

//  @desc   Get Allocation By Asset id
//  @route  GET /api/v1/allocation
//  @access  Private
export const getAllocationByAssetId = asyncHandler(async (req, res, next) => {
  let assetId = req.params.id;
  const allocations = await Allocation.find({ asset: assetId }).populate(
    allocationPopulate
  );
  res.status(200).json({
    success: true,
    data: allocations,
  });
});

//  @desc   Update Allocation By id
//  @route  PUT /api/v1/allocation
//  @access  Private
export const updateAllocation = asyncHandler(async (req, res, next) => {
  const update = await Allocation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate(allocationPopulate);
  if (!update) {
    return next(
      new ErrorResponse(`Allocation not found with id of ${req.params.id}`, 404)
    );
  }

  // ✅ If allocationType is "Owner", update Asset owner to the new user
  if (update.allocationType === 'Owner' && update.allocatedTo) {
    await Asset.findByIdAndUpdate(
      update.asset, // asset reference inside Allocation
      { owner: update.allocatedTo }, // set new owner
      { new: true }
    );
  }
  res.status(200).json({
    success: true,
    data: update,
  });
});
