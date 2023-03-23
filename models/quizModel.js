const mongoose = require("mongoose");
const slugify = require("slugify");
const validators = require("validator");
const User = require("./userModel");

//quizSchema
const quizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [30, "A quiz name must have at least 30 charaters"],
      // validate: [
      //   validators.isAlpha,
      //   "A tour name must contain only characters",
      // ],
    },
    question: {
      type: String,
      required: [true, "A quiz must have a question"],
      unique: true,
    },
    answers: {
      type: Map,
      required: [true, "A quiz must have answers"],
    },
    correctAnswer: String,
    reward: {
      type: Number,
      default: 1,
    },
    difficultyLevel: {
      type: Number,
      default: 3,
    },
    category: String,
    ratingsQuantity: Number,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [0, "A rating must be above 0"],
      max: [10, " A rating must be below 10"],
      set: (val) => Math.round(val * 10) / 10,
    },
    reward: {
      type: Number,
      default: 200,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    slug: String,
    secretQuiz: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val > this.ratingsAverage;
        },
        message:
          "The provided rating: ({VALUE}) should be higher than the ratingsAverage",
      },
    },
    admins: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  //Create another Object for Schema Options--ie. virtual property
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Embedding the admins into the tours collection -- presave middleware to return doocs
// quizSchema.pre("save", async function (next) {
//   const adminPromises = this.admins.map(async (id) => {
//     return await User.findById(id);
//   });

//console.log(adminPromises);
//   this.admins = await Promise.all(adminPromises);
//   next();
// });
//applying an index on the reward field
quizSchema.index({ slug: 1 });
quizSchema.index({ reward: 1, ratingsAverage: 1 });
//virtual Populate
quizSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "quiz",
  localField: "_id",
});

// Populate/ fill up all queries with additinal fields
quizSchema.pre(/^find/, function (next) {
  this.populate({
    path: "admins",
    select: "-__v -passwordChangedAt",
  });
  next();
});
//Virtual Properties
quizSchema.virtual("dailyReward").get(function () {
  return this.reward / 365;
});
// document middlewares

quizSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  console.log(this);
  next();
});

quizSchema.pre("save", function (next) {
  //console.log("Second Pre Middleware here ...");
  next();
});

quizSchema.post("save", function (doc, next) {
  //console.log(doc);
  next();
});
//Query Middlewares
quizSchema.pre(/^find/, function (next) {
  this.find({ secretQuiz: { $ne: true } });

  this.start = Date.now();

  next();
});

quizSchema.post(/^find/, function (doc, next) {
  console.log(`The query took ${Date.now() - this.start} milliseconds`);
  next();
});

//Aggregation Middleware
quizSchema.pre("aggregate", function (next) {
  const pipeline = this.pipeline().unshift({
    $match: {
      secretQuiz: {
        $ne: true,
      },
    },
  });

  next();
});
//The Model... name in uppercase
const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
