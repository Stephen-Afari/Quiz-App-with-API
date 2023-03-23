const express = require("express");
const Quiz = require("./../models/quizModel");
const catchAsync = require("./../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res) => {
  const quiz = await Quiz.find();
  //console.log(quiz);
  res.status(200).render("overview", {
    title: "All Questions",
    quiz,
  });
});

exports.getQuiz = catchAsync(async (req, res) => {
  const quiz = await Quiz.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  console.log(quiz);
  console.log(quiz.reviews[0].rating);
  res.status(200).render("quiz", {
    title: "JS Inventor",
    quiz,
  });
});
