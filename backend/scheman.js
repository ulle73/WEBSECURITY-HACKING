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
  imgUrl: String,
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
  ipAddress: { type: String }, 
 userAgent: {
    type: String,
    maxlength: 300
  }
});


const reservedProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GolfClub",
    required: true,
  },
  reservedAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 1000), // 15 minuter framåt
  },
  image: String,
});


export const User = mongoose.model("User", UserSchema);
export const GolfClub = mongoose.model("GolfClub", GolfClubSchema);
export const LoginLog = mongoose.model("LoginLog", LoginLogSchema);
export const ReservedProduct = mongoose.model(
  "ReservedProduct",
  reservedProductSchema
);