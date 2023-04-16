const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary').v2;

exports.newProduct = catchAsyncErrors (async(req, res, next) => {
  let images = [];
  if(typeof req.body.images === 'string') {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: 'products'
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url
    })
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Tạo mới sản phẩm thành công',
    product
  })
});

exports.getProducts = catchAsyncErrors (async (req, res, next) => {
  const resPerPage = 8;
  const productsCount = await Product.countDocuments();

  let apiFeatures = new APIFeatures(Product.find().sort({'createdAt': -1}), req.query)
    .search()
    .filter()

  let products = await apiFeatures.query;
  let filteredProductsCount = products.length;

  apiFeatures.pagination(resPerPage)
  products = await apiFeatures.query.clone();


  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products
  })
});

exports.getSingleProduct = catchAsyncErrors (async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if(!product) {
    return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
  };

  res.status(200).json({
    success: true,
    product
  })
});

exports.updateProduct = catchAsyncErrors (async (req, res, nest) => {
  let product = await Product.findById(req.params.id);
  if(!product) {
    return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
  }

  let images = [];
  if(typeof req.body.images === 'string') {
    images.push(req.body.images);
  } else {
    delete(req.body.images);
  }

  if(images !== undefined) {
    for(let i=0; i < product.images.length; i++) {
      const result = await cloudinary.uploader.destroy(product.images[i].public_id);
    }
  }

  let imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: 'products'
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url
    })
  }

  req.body.user = req.user.id;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Cập nhật sản phẩm thành công',
    product
  })
});

exports.deleteProduct = catchAsyncErrors (async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if(!product) {
    return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
  }

  for(let i=0; i < product.images.length; i++) {
    const result = await cloudinary.uploader.destroy(product.images[i].public_id);
  }
  
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Xóa sản phẩm thành công!'
  })
});
