const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/AppError");
const { promisify } = require("util");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
//Refactor the response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };
  //hide the password
  user.password = undefined;
  //add the secure option only whilst in production
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      users: user,
    },
  });
};
//update current user Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get the user from the collection
  console.log(req.user, req.body);
  const user = await User.findById(req.user.id).select("+password");
  //2) Confirm is password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  //assign the new Password and save
  (user.password = req.body.password),
    (user.passwordConfirm = req.body.passwordConfirm);
  await user.save();
  //send a response
  createSendToken(user, 200, res);
});

//Implement password Reset functionality
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)get the user based on his email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email", 404));
  }
  //2) Generate the random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Send it t user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
    //console.log(this.passwordResetToken);
    console.log(user);
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(hashedToken, user);
  //Return error if there's no such user
  if (!user) {
    return next(new AppError("Token invalid or Expired", 400));
  }
  //Set the password if successful
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //delete the token from the database
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //save data
  await user.save();
  //Log the user in by sign the jwt
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action,403")
      );
    }
    next();
  };
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //   //{Here addling only the data we need to the new user, excluding all others.
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  //   role: req.body.role,
  //   passwordResetToken: req.body.passwordResetToken,
  //   passwordResetExpires: req.body.passwordResetExpires,
  // })
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: "success",
  //   token,
  //   data: {
  //     users: newUser,
  //   },
  // });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Check if the user supplied an email or password
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //Check if the user is there and if he has a valid password?

  const user = await User.findOne({ email }).select("+password");
  //consolec.log(password, user.password);
  //const correct = user.correctPassword(password, user.password);
  //console.log(correct);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //console.log(user);
  //Sign the token

  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //If there's a header called authorization with a value that starts with Bearer then...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }
  //console.log(token);
  //Verify the JWT..promisify the verification to return a promise with the decoded json data
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //Check if the logged in user has been deleted or not(ie. still exists)
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this Token, no longer exists", 401)
    );
  }

  //Check if user has recently changed their password
  //console.log(freshUser.changedPasswordAfter(decoded.iat));
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password!!", 401));
  }
  req.user = freshUser;

  next();
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
