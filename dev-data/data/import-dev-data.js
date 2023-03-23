const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const Quiz = require("../../models/quizModel");
// //console.log(app.get('env'));
//console.log(path.resolve(__dirname, "../../config.env"));
//NB path.resovle give the absolute file path, from the current directory, it moves two levels above(ie. "../../config.env") to access the config.env file
dotenv.config({ path: path.resolve(__dirname, "../../config.env") });
//console.log(process.env.NODE_ENV);
const { argv } = require("process");
console.log(process.env.DATABASE);

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

//Read JSON
const quiz = JSON.parse(fs.readFileSync(`${__dirname}/quiz.json`, "utf-8"));

//Import Data into DB
const importData = async () => {
  try {
    await Quiz.create(quiz);
    console.log("Data Successfully loaded");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Quiz.deleteMany();
    console.log("Data Successfully deleted!!");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
//console.log(argv);
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
