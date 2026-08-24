import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    is_current: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

const AcademicYear =
  mongoose.model("AcademicYear", academicYearSchema);

export default AcademicYear;