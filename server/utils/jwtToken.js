const User = require("../models/user");

const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const options = {
    exprires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: 'auto',
    sameSite: 'none'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user
  });
}

module.exports = sendToken;
