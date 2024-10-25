import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["user", "superuser", "admin"], default: "user" },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: String },
});

UserSchema.methods.isLocked = function () {
  const lockUntilDate = new Date(this.lockUntil).getTime();
  return this.lockUntil && lockUntilDate > Date.now();
};

const GolfClubSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price: Number,
  quantity: Number,
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      review: String,
      rating: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

const LoginLogSchema = new mongoose.Schema({
  username: String,
  time: { type: String, default: Date.now },
  success: Boolean,
  message: String,
});



export const User = mongoose.model("User", UserSchema);
export const GolfClub = mongoose.model("GolfClub", GolfClubSchema);
export const LoginLog = mongoose.model("LoginLog", LoginLogSchema);