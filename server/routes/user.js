const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  logout, 
  forgotPassword, 
  resetPassword, 
  getCurrentUser,
  updatePassword,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateProfile,
  newUser
} = require('../controllers/userController');

const { isAuthenticateUser, authorizeRoles } = require('../middleware/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/me').get(isAuthenticateUser, getCurrentUser);
router.route('/me/update').put(isAuthenticateUser, updateProfile);
router.route('/password/update').put(isAuthenticateUser, updatePassword);
router.route('/admin/users').get(isAuthenticateUser, 
  authorizeRoles('admin', 'staff'), getAllUsers);
router.route('/admin/user/:id')
  .get(isAuthenticateUser, authorizeRoles('admin', 'staff'), getSingleUser)
  .put(isAuthenticateUser, authorizeRoles('admin'), updateUser)
  .delete(isAuthenticateUser, authorizeRoles('admin'), deleteUser);
router.route('/admin/user/new')
  .post(isAuthenticateUser, authorizeRoles('admin'), newUser);

module.exports = router;
