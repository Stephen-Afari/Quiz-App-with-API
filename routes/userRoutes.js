const express = require("express");
const userController = require("../controller/userController");
const authController = require("./../controller/authController");

const app = express();
//Create separate routes for Questions and users into different files
const router = express.Router();

router.route("/forgetPassword").post(authController.forgetPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);
router.route("/login").post(authController.login);
router.route("/signup").post(authController.signUp);
//use the protect middleware on this miniapp, to protect all the routes below
router.use(authController.protect);

// Mount the router as a middle ware on the questions route
router.patch("/updateMyPassword", authController.updatePassword);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
//app.use('/api/v1/users', router)

//All other routes should go on top of this root route... else it might not work
router.get("/me", userController.getMe, userController.getUser);
//restricting the routes below to only adminstrators
router.use(authController.restrictTo("admin"));
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
