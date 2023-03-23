const { application } = require("express");
const express = require("express");
//const fs = require("fs");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const quizRouter = require("./routes/quizRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controller/errorController");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const reviewRouter = require("./routes/reviewRoutes");
const path = require("path");
const viewRouter = require("./routes/viewRoutes");

//const dotenv = require("dotenv");
//console.log(app.get('env'));

//dotenv.config({ path: "./config.env" });

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
//const userRouter = express.Router();

//Mount the router as a middle ware on the questions route
//NB: This is where we connect the: questionRoutes and userRoutes to the app(ie. connect the miniapps to the main app)

//Implement rate Limiting-- limit requests coming from 1 ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
//Use the limiter on all routs starting with API
app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "10kb" }));

//prevent XSS and NoSQL injections...
app.use(mongoSanitize());
app.use(xss());
//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["reward", "ratingsAverage", "difficultyLevel"],
  })
);
//Global Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);

  next();
});
//Looks for the base file inside the views folder as specified above

//ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/reviews", reviewRouter);
//mounting the root route on the viewRouter
app.use("/", viewRouter);
app.use(express.static(path.join(__dirname, "public")));
//HANDLING ERRORS

//2) Creating an error-- This is for all other unhandled error
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `The url: ${req.originalUrl} is not available on this Server.`,
      404
    )
  );
});

//1)Global error handling Middleware
app.use(globalErrorHandler);

// ALL OTHER ROUTES
// app.all("*", (req, res, next) => {
//   res.status(404).json({
//     status: "failed",
//     message: `The url: ${req.originalUrl} is not available on this Server.`,
//   });
// });

//Midleware that puts the body on the request
//class=`reviews__star--{review.rating >= star ? 'active' : 'inactive'}`
///////////////////////////////////

module.exports = app;
