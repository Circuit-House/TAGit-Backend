import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../middleware/async.js';
import Allocation from '../models/Allocation.js';

//  @desc   Create Allocation
//  @route  POST /api/v1/allocation
//  @access  Private
export const createAllocation = asyncHandler(async (req, res, next) => {
  const create = await Allocation.create(req.body);
  res.status(200).json({
    success: true,
    data: create,
  });
});

//  @desc   Get Allocation By id
//  @route  GET /api/v1/allocation
//  @access  Private
export const getAllocation = asyncHandler(async (req, res, next) => {
  const create = await Allocation.find(req.params.id);
  res.status(200).json({
    success: true,
    data: create,
  });
});

//  @desc   Update Allocation By id
//  @route  PUT /api/v1/allocation
//  @access  Private
export const updateAllocation = asyncHandler(async (req, res, next) => {
  const update = await Allocation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: update,
  });
});
