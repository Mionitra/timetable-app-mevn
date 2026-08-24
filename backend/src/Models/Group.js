import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    study_level: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
  },

  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;