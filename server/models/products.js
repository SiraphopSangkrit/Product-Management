const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: { 
        type: Number, 
        required: true 
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: { 
        type: String 
    },
    quantity: { 
        type: Number, 
        default: 0 
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });


const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
