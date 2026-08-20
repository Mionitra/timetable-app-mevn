import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Semester = mongoose.model("Semester", semesterSchema);
export default Semester;
