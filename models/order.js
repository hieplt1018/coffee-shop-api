const mongoose = require('mongoose');

const PAYMENT_METHOD = ['Card', 'Cash', 'COD', 'Banking'];
const ORDER_STATUS = ['Completed', 'Cancelled', 'Delivering'];

const orderSchema = mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: [true, 'Hãy nhập địa chỉ giao hàng'],
      trim: true,
      maxLength: [300, 'Vượt quá 300 ký tự']
    },
    telNum: {
      type: String,
      required: [true, 'Hãy nhập số điện thoại'], 
      trim: true,
      validate: {
        validator: function(telNum) {
          var regex = /(0[3|5|7|8|9])+([0-9]{8})\b/g;
          return (!telNum || !telNum.trim().length) || regex.test(telNum);
        },
        message: 'Số điện thoại đã cung cấp không hợp lệ'
      }
    }
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [300, 'Vượt quá 300 ký tự']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        required: true,
        max: [1000000, 'Không thể vượt quá 1.000.000'],
        min: [0, 'Không thể dưới 0'],
        default: 0
      },
      itemPrice: {
        type: Number,
        required: true,
        max: [100000000, 'Không thể vượt quá 100.000.000'],
        min: [0, 'Không thể dưới 0'],
        default: 0
      }
    }
  ],
  paymentInfo: {
    type: String,
    required: true,
    enum: {
      values: PAYMENT_METHOD,
      message: 'Vui lòng chọn phương thức thanh toán khả dụng'
    },
    default: 'Cash'
  },
  totalItemsPrice: {
    type: Number,
    required: true,
    min: [0, 'Không thể dưới 0'],
    max: [1000000000, 'Không thể vượt quá 1.000.000.000'],
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    max: [1000000000, 'Không thể vượt quá 1.000.000.000'],
    min: [0, 'Không thể dưới 0'],
    default: 0
  },
  totalOrder: {
    type: Number,
    required: true,
    max: [1000000000, 'Không thể vượt quá 1.000.000.000'],
    min: [0, 'Không thể dưới 0'],
    default: 0
  }, 
  paidAt: {
    type: Date,
    default: Date.now,
    required: [true, 'Hãy nhập ngày thanh toán']
  },
  orderStatus: {
    type: String,
    required: true,
    enum: {
      values: ORDER_STATUS,
      message: 'Vui lòng chọn trạng thái đơn hàng sẵn có'
    },
    default: ORDER_STATUS[2]
  },
  deliveredAt: {
    type: Date,
    required: [true, 'Hãy nhập ngày vận chuyển'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
