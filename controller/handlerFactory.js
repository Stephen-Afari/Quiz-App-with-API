const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");

//delete factory function to be applied in every Model
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document with that id", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

//update factory function to be applied in every model
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    //If quiz is null( ie. no quiz) trigger the global error handler
    if (!doc) {
      return next(new AppError("No quiz found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  (createQuiz = catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  }));
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No quiz found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.quizId) filter = { quiz: req.params.quizId };
    console.log(filter);
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const doc = await features.query;
    //console.log(quiz);
    ///////////////////////////////END
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
