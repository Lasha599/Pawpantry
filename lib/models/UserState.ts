import mongoose from 'mongoose';

const UserStateSchema = new mongoose.Schema({
  userId:        { type: String, required: true, unique: true },
  dogs:          { type: Array, default: [] },
  subscriptions: { type: Array, default: [] },
  history:       { type: Array, default: [] },
  updatedAt:     { type: Date, default: Date.now },
});

export const UserState =
  mongoose.models.UserState ?? mongoose.model('UserState', UserStateSchema);
