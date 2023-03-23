class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    //1) Filtering
    //Create a shadow copy of req.query
    const queryObj = { ...this.queryStr };
    //2) Advanced Filtering
    //parameters to exclude from the query String
    const excludedFields = ["page", "sort", "limit", "fields"];
    //Loop through and delete all parameters from the excluded Fields above
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }
  sort() {
    //3) Sorting
    if (this.queryStr.sort) {
      //Remove the comma and add a space( in line with mongoose sort)
      const sortBy = this.queryStr.sort.split(",").join(" ");
      console.log(this.queryStr.sort);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("createdAt");
    }
    return this;
  }
  limit() {
    //4) Limiting fields
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    //5 Pagination
    //Limit= results in a query, skip=pages to skip be4 running query
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
    // if (this.queryStr.page) {
    //   const numQuiz = await this.query.countDocuments();
    //   console.log(skip, numQuiz);
    //   if (skip >= numQuiz) throw new Error("This page does not exist!!");
    // }
  }
}
module.exports = APIFeatures;
