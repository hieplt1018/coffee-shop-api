const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require('../models/user');

exports.isAuthenticateUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if(!token) {
    return next(new ErrorHandler('Hãy đăng nhập để có thể truy cập.', 401));
  };

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} không được phép truy cập.`,
        403));
    };
    next();
  }
}
