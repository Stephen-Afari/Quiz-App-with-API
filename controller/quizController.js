const { match } = require("assert");
const fs = require("fs");
const { findByIdAndDelete, aggregate } = require("../models/quizModel");
const Quiz = require("../models/quizModel");
const APIFeatures = require("../utils/APIFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const factory = require("./handlerFactory");
// //Read quiz questions once
// const questions = JSON.  parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/quiz.json`)
//   );

//create a Middleware to check if an id exists...
//  exports.checkID = (req,res,next,val)=>{
//     //console.log(req.params.id,questions.allQuestions.length)
// //     if (req.params.id * 1 > questions.allQuestions.length) {
// //       return res.status(404).json({
// //         status: "fail",
// //         message: "Invalid_id",
// //       });
// //  }
//  next();
// }
//Class

// //Route Handlers
exports.getAllQuizes = factory.getAll(Quiz);
exports.updateQuiz = factory.updateOne(Quiz);

exports.deleteQuiz = factory.deleteOne(Quiz);

exports.getQuiz = factory.getOne(Quiz, { path: "reviews" });

exports.createQuiz = factory.createOne(Quiz);
exports.aliasBestQuestions = (req, res, next) => {
  req.query.limit = 3;
  req.query.sort = "-ratingsAverage,difficultyLevel";
  req.query.fields = "question,category,answers,difficultyLevel,ratingsAverage";
  next();
};

exports.getQuizStats = async (req, res) => {
  try {
    //console.log(Quiz.find());
    const stats = await Quiz.aggregate([
      {
        $match: {
          difficultyLevel: {
            $gte: 5.0,
          },
        },
      },
      {
        $group: {
          //the _id here refers to the grouping for each stat or documents
          _id: { $toUpper: "$category" },
          numQuiz: { $sum: 1 },
          numRatings: { $sum: "$ratingsAverage" },
          avgRating: { $avg: "$ratingsAverage" },
          minRating: { $min: "$ratingsAverage" },
          maxRating: { $max: "$ratingsAverage" },
          // totalReward: { $add: "$reward" },
        },
      },
      {
        $sort: { ratingsAverage: 1 },
      },
      // {
      //   $match: {
      //     _id: {
      //       $ne: "science",
      //     },
      //   },
      // },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
