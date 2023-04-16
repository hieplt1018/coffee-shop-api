const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const APIFeatures = require('../utils/apiFeatures');

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, shippingInfo } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'avatars/defaultuser',
      url: 'https://imageio.forbes.com/specials-images/imageserve/5c76bcaaa7ea43100043c836/0x0.jpg'
    },
    shippingInfo
  });

  sendToken(user, 200, res);
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if(!email || !password) {
    return next(new ErrorHandler('Hãy nhập email và password', 400));
  };

  const user = await User.findOne({ email }).select('+password');
  if(!user) {
    return next(new ErrorHandler('Email hoặc password không chính xác', 401));
  };

  const isPasswordMatched = await user.comparePassword(password);
  if(!isPasswordMatched) {
    return next(new ErrorHandler('Email hoặc password không chính xác'));
  }

  const token = user.getJwtToken();
  sendToken(user, 200, res);
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if(!user) {
    return next(new ErrorHandler('Không tìm thấy người dùng với email này', 404));
  };

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
  const message = `Mã token đặt lại mật khẩu của bạn như sau:\n\n${resetUrl}\n\n
  Nếu bạn chưa yêu cầu email này, hãy bỏ qua nó.`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Catata Coffee khôi phục mật khẩu ',
      message
    });

    res.status(200).json({
      success: true,
      message: `Email đã gửi tới: ${user.email}`
    })
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if(!user) {
    return next(new ErrorHandler('Mã token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
      , 400));
  };
  
  if(req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Mật khẩu không giống nhau', 400));
  };

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  sendToken(user, 200, res);
});

exports.getCurrentUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isMatched = await user.comparePassword(req.body.oldPassword);
  if(!isMatched) {
    return next(new ErrorHandler('Mật khẩu cũ không chính xác', 400));
  };

  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);
});

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i'
    }
  } : {}

  const apiFeatures = new APIFeatures(User.find({ ...keyword }).sort({'createdAt': -1}), req.query)
    .search().filter().pagination(resPerPage);  
  const users = await apiFeatures.query;
  const totalUsers = await User.find({...keyword});
  const usersCount = totalUsers.length;

  res.status(200).json({
    success: true,
    usersCount,
    users,
    resPerPage
  })
});

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user) {
    return next(new ErrorHandler(`Không tìm thấy người dùng`
      , 400));
  };

  res.status(200).json({
    success: true,
    user
  });
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    shippingInfo: req.body.shippingInfo
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    message: 'Cập nhật thành công!',
    user
  });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user) {
    return next(new ErrorHandler(`Không tìm thấy người dùng`
      , 400));
  };

  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Đã xóa thành công!'
  });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    shippingInfo: req.body.shippingInfo
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    message: 'Cập nhật thành công!'
  });
});

exports.newUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, shippingInfo, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'avatars/defaultuser',
      url: 'https://imageio.forbes.com/specials-images/imageserve/5c76bcaaa7ea43100043c836/0x0.jpg'
    },
    shippingInfo,
    role
  });

  res.status(201).json({
    success: true,
    message: 'Tạo mới tài khoản thành công',
    user
  })
});

exports.logout = catchAsyncErrors( async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: "Đăng xuất thành công!"
  });
});
