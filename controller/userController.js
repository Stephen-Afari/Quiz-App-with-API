const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const factory = require("./handlerFactory");

//getMe
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};
//delete the current user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
//Update the current user
//1) Create error if user posts password data
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates", 400));
  }
  const filteredBody = filteredObj(req.body, "name", "email");
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      users: updatedUser,
    },
  });
});
//filter object function
const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//Route Handlers
exports.getAllUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  res.status(200).json({
    status: "error",
    message: "This route is not yet defined",
  });
};

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
