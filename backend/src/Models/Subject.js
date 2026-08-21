import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    code: {
      type: String,
      unique: true,
      required: true,
      maxlength: 20,
    },
    credits: {
      type: Number,
      required: true,
    },
    duree: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      maxlength: 20,
      default: null,
    },
    semester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      default: null,
    },
    user_id: {

      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;