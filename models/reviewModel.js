const mongoose = require("mongoose");
const Quiz = require("./quizModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, " Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    quiz: {
      ref: "Quiz",
      type: mongoose.Schema.ObjectId,
      require: [true, "Review must belong to a tour"],
    },
    user: {
      ref: "User",
      type: mongoose.Schema.ObjectId,
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//setting compound index on quiz & user
reviewSchema.index({ quiz: 1, user: 1 }, { unique: true });

//Do a summary of reviews using static method
reviewSchema.statics.calculateAverageRatings = async function (quizId) {
  const stats = await this.aggregate([
    {
      $match: { quiz: quizId },
    },
    {
      $group: {
        _id: "$quiz",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Quiz.findByIdAndUpdate(quizId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Quiz.findByIdAndUpdate(quizId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//A pre-middleware for the findByIdAndUpdate and findByIdAndDelete hooks
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

//Post query middleware that receives the quizId from the premiddleware
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calculateAverageRatings(this.r.quiz);
});

//Use a Midddleware to call statics method
reviewSchema.post("save", function (next) {
  this.constructor.calculateAverageRatings(this.quiz);
  //console.log(this.quiz);
});
//Populate the user and quiz
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
