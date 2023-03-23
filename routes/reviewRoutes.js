const express = require("express");
const authController = require("./../controller/authController");
const reviewController = require("./../controller/reviewController");

const router = express.Router({ mergeParams: true });
//Protect all the routes below...
router.use(authController.protect);
router
  .route("/:id")
  .patch(authController.restrictTo("admin"), reviewController.updateReview)
  .delete(
    authController.restrictTo("admin", "user"),
    reviewController.deleteReview
  )
  .get(reviewController.getReview);
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setQuizUserIds,
    reviewController.createReview
  );

module.exports = router;
