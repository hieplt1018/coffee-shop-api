const express = require('express');
const router = express.Router();
const { isAuthenticateUser, authorizeRoles } = require('../middleware/auth');
const { 
  newOrder, 
  getMyOrders, 
  getSingleOrder,
  getAllOrders,
  updateProcessOrder,
  deleteOrder,
  getSingleOrderAdmin
} = require('../controllers/orderController');

router.route('/order/new').post(isAuthenticateUser, newOrder);
router.route('/orders/me').get(isAuthenticateUser, getMyOrders);
router.route('/order/:id').get(isAuthenticateUser, getSingleOrder);
router.route('/admin/orders')
  .get(isAuthenticateUser, authorizeRoles('staff', 'admin'), getAllOrders);
router.route('/admin/order/:id')
  .put(isAuthenticateUser, authorizeRoles('staff','admin'), updateProcessOrder)
  .delete(isAuthenticateUser, authorizeRoles('admin'), deleteOrder)
  .get(isAuthenticateUser, authorizeRoles('staff', 'admin'), getSingleOrderAdmin);

module.exports = router;
