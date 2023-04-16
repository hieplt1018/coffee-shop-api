const mongoose = require('mongoose');

const CATEGORIES = ['Cake', 'Coffee', 'Coffee Bean', 'Pastries', 'Bread'];

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxLength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    maxLength: [7, 'Giá của sản phẩm không được vượt quá 7 ký tự'],
    max: [1000000, 'Giá sản phẩm không được vượt quá 1.000.000'],
    min: [0, 'Giá sản phẩm không thể dưới 0'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    trim: true,
    maxLength: [3000, 'Tên sản phẩm không được vượt quá 3000 ký tự']
  },
  images: [
    {
      public_id: {
        type: String,
        maxLength: [300, 'không hợp lệ']
      },
      url: {
        type: String,
        maxLength: [300, 'không hợp lệl']
        }
    }
  ],
  category: {
    type: String,
    required: [true, 'Vui lòng chọn danh mục cho sản phẩm này'],
    enum: {
      values: CATEGORIES,
      message: 'Vui lòng chọn trong danh mục có sẵn'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng sản phẩm'],
    max: [1000, 'Số lượng của sản phẩm không được vượt quá 1000'],
    min: [0, 'Số lượng của sản phẩm không thể dưới 0'],
    default: 0
  },
  supplier: {
    type: String,
    required: [true, 'Vui lòng nhập nhà cung cấp'],
    trim: true,
    maxLength: [300, 'Tên sản phẩm không được vượt quá 300 ký tự'],
    default: "Cantata Coffee"
  },
  hotTrend: {
    type: Boolean,
    required: [true, 'Vui lòng nhập sự yêu thích'],
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
