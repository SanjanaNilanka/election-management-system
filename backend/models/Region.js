const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['district', 'province', 'municipal', 'urban', 'pradeshiya-sabha'] }
});
module.exports = mongoose.model('Region', regionSchema);