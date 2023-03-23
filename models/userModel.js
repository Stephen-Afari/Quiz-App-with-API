const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Tell us your name"],
  },

  email: {
    type: String,
    required: [true, "Tell us your email"],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  role: String,
  photo: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//Creating an instance method: available on all documents in the collection
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
//   return await bcrypt.compare(candidatePassword, userPassword);
// }

//updating the changedPasswordAt property for the user
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//find only documents with active fields set to true
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//Resetting password
userSchema.methods.createPasswordResetToken = function () {
  //reset token created with crypto
  const resetToken = crypto.randomBytes(32).toString("hex");
  //encrypt the token going in the database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(resetToken, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(this.passwordResetExpires);
  return resetToken;
};

//Encrypting the password with bcrypt algorithm before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log(!this.isModified("password"));
  this.password = await bcrypt.hash(this.password, 12);

  //prevent passwordConfirm from persisting in the database
  this.passwordConfirm = undefined;
  next();
});
//Check if there's been a password Change after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;

    console.log(changedTimeStamp, JWTTimestamp);
  }

  return false;
};
//Compare passwords
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//NB: The Mongoose Middlewares should go above  the Model and exports below
const User = mongoose.model("User", userSchema);
module.exports = User;
