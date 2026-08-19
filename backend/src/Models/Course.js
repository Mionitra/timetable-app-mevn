import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: ["CM", "TD", "TP", "EXAMEN"],
      required: true,
    },

    courseDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },

    room: {
      type: String,
      default: null,
    },

    building: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "upcoming",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "upcoming",
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ subject: 1 });
courseSchema.index({ teacher: 1 });
courseSchema.index({ courseDate: 1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;