const mongoose = require('mongoose');
const { Schema } = mongoose;
const GNSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  gnDivision: { type: String, required: true },
});

module.exports = mongoose.models.GN || mongoose.model('GN', GNSchema);