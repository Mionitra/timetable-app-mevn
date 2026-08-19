import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },

    color: {
      type: String,
      default: "blue",
    },

    description: {
      type: String,
      default: "",
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ code: 1 });
subjectSchema.index({ teacher: 1 });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;