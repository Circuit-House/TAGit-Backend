import mongoose from 'mongoose';

const AllocationSchema = mongoose.Schema({
  allocatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  allocatedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  allocatedRequestDate: {
    type: Date,
    default: Date.now(),
  },
  asset: {
    type: mongoose.Schema.ObjectId,
    ref: 'Asset',
    required: true,
  },
  purpose: { type: String },
  allocationType: {
    type: String,
    required: [true, 'Please provide allocation type'],
  },
  requestStatus: { type: Boolean },
  allocationStatusDate: { type: Date },
  duration: {
    startTime: { type: Date },
    endTime: { type: Date },
  },
});

export default mongoose.model('Allocation', AllocationSchema);
