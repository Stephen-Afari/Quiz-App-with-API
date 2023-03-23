const express = require("express");
const router = express.Router();
const viewController = require("./../controller/viewController");

// router.get("/", (req, res) => {
//   res.status(200).render("base", {
//     quiz: "JS Inventor2",
//     user: "Afari",
//   });
// });
router.get("/quiz/:slug", viewController.getQuiz);
router.get("/", viewController.getOverview);

router.get("/quiz", viewController.getQuiz);
module.exports = router;
