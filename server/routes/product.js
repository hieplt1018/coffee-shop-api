const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  newProduct, 
  getSingleProduct, 
  updateProduct, 
  deleteProduct
} = require('../controllers/productController');
const { isAuthenticateUser, authorizeRoles } = require('../middleware/auth');

router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);
router.route('/admin/product/new').post(isAuthenticateUser, authorizeRoles('admin'),
  newProduct);
router.route('/admin/products').get(isAuthenticateUser, authorizeRoles('admin', 'staff'), getProducts);
router.route('/admin/product/:id')
  .put(isAuthenticateUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticateUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;
