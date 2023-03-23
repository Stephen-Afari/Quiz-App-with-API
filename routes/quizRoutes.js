const express = require("express");
const authController = require("./../controller/authController");

const quizController = require("../controller/quizController");
const reviewController = require("./../controller/reviewController");
const reviewRouter = require("./reviewRoutes");

//Create separate routes for Questions and users into different files
const router = express.Router();
// Mount the router as a middle ware on the questions route
//app.use('/api/v1/questions', router)

//console.log(questions);
// Param middlewares
//router.param("id", questionController.checkID)
//Route handler-middlewares
// router
//   .route("/:quizId/reviews")
//   .post(
//     authController.protect,
//     authController.restrictTo("user"),
//     reviewController.createReview
//   );
//Mounting the reviewRouter on the given path
router.use("/:quizId/reviews", reviewRouter);

router.route("/quiz-stats").get(quizController.getQuizStats);
router
  .route("/top-3-best")
  .get(quizController.aliasBestQuestions, quizController.getAllQuizes);
//All other routes should go on top of this root route... else it might not work
router
  .route("/")
  .get(quizController.getAllQuizes)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    quizController.createQuiz
  );

router
  .route("/:id")
  .get(quizController.getQuiz)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    quizController.deleteQuiz
  )
  .patch(quizController.updateQuiz);

module.exports = router;
