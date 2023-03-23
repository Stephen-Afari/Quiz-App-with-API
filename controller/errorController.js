const AppError = require("./../utils/AppError");
//Handling JWT Errors
const handleJWTError = () => {
  return new AppError("Invalid Token. Please log in again!!!", 401);
};
//Handling Token Expired Error
const handleJWTExpiredError = () => {
  new AppError("Your token has expired!!!", 401);
};
//Handling validator Errors
const handleValidatorErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input Data ${errors.join(". ")}`;
  return new AppError(message, 400);
};
//Handling duplicate Fields errors
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};
//Handling castErrors..path and value are seen from the error messages in Postman
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} is ${err.value}`;
  return new AppError(message, 400);
};
//Function for Development Errors
const sendErrorDev = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      //error: err,
      message: err.message,
      //stack: err.stack,
    });
  } else {
    //console.error("ERROR", err.name);
    res.status(500).json({
      // status: "error",
      // message: "Something went very wrong!!",
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

//Function for Production Errors
const sendErrorProd = (err, res) => {
  //Create a hardcopy of the error

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",

      // status: err.status,
      // error: err,
      // message: err.message,
      // stack: err.stack,
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    //Create a hardcopy of the error
    let error = Object.assign(err);
    console.log(error.code);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidatorErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    //console.error("ERROR", err.name);
    sendErrorProd(error, res);
  }
};
