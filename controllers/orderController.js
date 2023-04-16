const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const Order = require('../models/order');

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.create(req.body);
  const cartItems = req.body.orderItems;
  cartItems.forEach(async item => {
    await updateStock(item.product, item.quantity, 'Delivering');
  });

  res.status(200).json({
    success: true,
    message: 'Đơn hàng tạo thành công!',
    order
  });
});

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'orderItems',
    populate: {path: 'product'}
  });

  if( !order || order.customer.valueOf() !== req.user.id ) {
    return next(new ErrorHandler('Không tìm thấy đơn đặt hàng', 404));
  };

  res.status(200).json({
    success: true,
    order
  })
});

exports.getSingleOrderAdmin = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'orderItems',
    populate: {path: 'product'}
  });

  if( !order) {
    return next(new ErrorHandler('Không tìm thấy đơn đặt hàng', 404));
  };

  res.status(200).json({
    success: true,
    order
  })
});

exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const keyword = req.query.keyword ? {
    name: {
      $regex: req.query.keyword,
      $options: 'i'
    }
  } : {}

  const apiFeatures = new APIFeatures(Order.find({ ...keyword }).sort({'createdAt': -1}), req.query)
    .search().filter().pagination(resPerPage);  
  const orders = await apiFeatures.query;
  const totalOrders = await Order.find({...keyword});
  const ordersCount = totalOrders.length;

  res.status(200).json({
    success: true,
    ordersCount,
    orders,
    resPerPage
  })
});

exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ customer: req.user.id })
    .populate('customer', 'name');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders
  });
});

exports.updateProcessOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  order.orderItems.forEach(async item => {
    await updateStock(item.product, item.quantity)
  });
  
  order.orderStatus = req.body.orderStatus,
  order.deliveredAt = Date.now();
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật trạng thái thành công',
    order
  });
});

async function updateStock(id, quantity, status) {
  const product = await Product.findById(id);
  if(status === 'Delivering') {
    product.stock = product.stock - quantity;
  } else {
    product.stock = product.stock + quantity;
  }
  
  await product.save();
};

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if(!order) {
    return next(new ErrorHandler('Không tìm thấy đơn đặt hàng', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Xóa đơn hàng thành công"
  })
});
