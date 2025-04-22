// import mongoose from "mongoose";

// const eventSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     image: { type: String, default: "" }, // ✅ Base64 or Cloudinary URL
//     date: { type: Date, required: true },
//     location: { type: String, required: true },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     createdByRole: {
//       type: String,
//       enum: ["admin", "head", "student", "user"], // ✅ Added "student" and "user"
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const Event = mongoose.model("Event", eventSchema);
// export default Event;
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["admin", "head", "student", "user"],
      required: true,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Likes on event
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ], // ✅ Comments on event
    sharedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    }, // ✅ Shared event reference
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
