const router = require('express').Router();
const CategoryController = require('../controllers/CategoryController');

router.get('/categories', CategoryController.getAllCategories);
router.post('/category', CategoryController.createCategory);
router.put('/category/:id', CategoryController.updateCategory);
router.delete('/category/:id', CategoryController.deleteCategory);

const ProductController = require('../controllers/ProductController');

router.get('/products', ProductController.getAllProducts);
router.post('/product', ProductController.createProduct);
router.put('/product/:id', ProductController.updateProduct);
router.delete('/product/:id', ProductController.deleteProduct);

module.exports = router;
