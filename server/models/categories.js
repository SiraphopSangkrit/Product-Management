const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
}, { timestamps: true });

CategorySchema.index({ name: 'text' });

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
