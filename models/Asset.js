import mongoose from 'mongoose';

const AssetSchema = mongoose.Schema({
  name: { type: String, required: true },
  serialNo: {
    type: String,
    required: [true, 'Please add a Serial Number'],
  },
  warranty: {
    type: Date,
    required: [true, 'Please add Warranty Date'],
  },
  invoiceAvailable: {
    type: Boolean,
    required: true,
  },
  invoiceUrl: { type: String },
  photoUrl: { type: String },
  purchaser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceType: { type: String },
  allocation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Allocation',
  },
  availablity: { type: String },
  purchasedOn: { type: Date },
});

export default mongoose.model('Asset', AssetSchema);
