
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
});

const certificationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  institute: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  description: { type: String },
  file: { type: String },
  isVerified: { type: Boolean, default: false },
});
const skillSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  description: { type: String },
  isSkillVerified: { type: Boolean, default: false },
  skillStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  image: { type: String },
});

const educationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  school: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },

    userType: {
      type: String,
      enum: ["regular", "head"],
      default: "regular",
      required: function () {
        return this.role === "user";
      }, // 🟢 Only applies to "user"
    },

    profilePicture: { type: String, default: "" },
    bannerImg: { type: String, default: "" },
    headline: { type: String, default: "UniLink User" },
    location: { type: String, default: "SRM University AP" },
    about: { type: String, default: "" },
    skills: [skillSchema],

    experience: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],

    isVerified: { type: Boolean, default: false },
    isSkillsVerified: { type: Boolean, default: false },
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
