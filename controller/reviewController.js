const Review = require("./../models/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getAllReviews = factory.getAll(Review);
//Get a review
exports.getReview = factory.getOne(Review);
//set the user ids
exports.setQuizUserIds = (req, res, next) => {
  if (!req.body.quiz) req.body.quiz = req.params.quizId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
