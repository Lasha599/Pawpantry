import mongoose from 'mongoose';

const ScrapedProductSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  price:     { type: Number, default: 0 },
  currency:  { type: String, default: 'GEL' },
  image:     { type: String, default: '' },
  url:       { type: String, required: true, unique: true },
  store:     { type: String, required: true },
  storeUrl:  { type: String, required: true },
  category:  { type: String, default: 'dog-food' },
  weight:    { type: String, default: '' },
  brand:     { type: String, default: '' },
  scrapedAt: { type: Date, default: Date.now },
});

export const ScrapedProduct =
  mongoose.models.ScrapedProduct ??
  mongoose.model('ScrapedProduct', ScrapedProductSchema);
