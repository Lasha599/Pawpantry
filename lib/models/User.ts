import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  email:             { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:          { type: String, required: true },
  resetToken:        { type: String, default: null },
  resetTokenExpiry:  { type: Date, default: null },
  createdAt:         { type: Date, default: Date.now },
});

export const User = mongoose.models.User ?? mongoose.model('User', UserSchema);
