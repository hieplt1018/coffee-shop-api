const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ROLE = ['admin', 'customer', 'staff'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên của bạn'],
    maxLength: [100, 'Không thể vượt quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    maxLength: [100, 'Không thể vượt quá 100 ký tự'],
    validate: [validator.isEmail, 'Vui lòng nhập địa chỉ email hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu của bạn'],
    minLength: [6, 'Mật khẩu của bạn phải dài hơn 6 ký tự'],
    select: false
  },
  avatar: {
    public_id: {
      type: String,
      maxLength: [300, 'không hợp lệ']
    },
    url: {
      type: String,
      maxLength: [300, 'không hợp lệ']
    }
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: ROLE,
      message: 'Vui lòng chọn một vai trò có sẵn'
    },
    default: 'customer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
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
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) {
    next();
  };

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });
}

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
}

module.exports = mongoose.model('User', userSchema);
