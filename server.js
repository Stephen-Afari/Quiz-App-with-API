const dotenv = require("dotenv");
// //console.log(app.get('env'));
dotenv.config({ path: "./config.env" });
//NB the import of this app should happen after the dotenv
const app = require("./app");
const mongoose = require("mongoose");

//Catching errors outside Express and the Server
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down");
  console.log(err.name, err.message);
  process.exit(1);
});

//Replace the password
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    try {
      //console.log(con.connections);
      console.log("DB connection successful!");
    } catch (err) {
      console.error(err);
    }
  });

//create a document
// const testQuiz = new Quiz({
//   question: "Which one of these is required for full stack development?",
//   answers: "a: Javascript  b: NodeJS   c: Backend development",
//   correct_answer: "a",
//   //reward: 100,
// });
// //save the document
// testQuiz
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log("ERROR:", err);
//   });
console.log(process.env.NODE_ENV);
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port} ...`);
  //console.log(process.argv);
});

//handling unhandled promise rejections -- all over the code
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });

  console.log("UNHANDLED REJECTION! Shutting down.");
});

//console.log(x);
//URL for published API
//https://documenter.getpostman.com/view/12016424/2s8YsnXbZn
