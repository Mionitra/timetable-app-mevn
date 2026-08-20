import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    niveau: {
      type: String,
      enum: ["L1", "L2", "L3"],
      required: true,
    },

    filiere: {
      type: String,
      enum: ["IAD", "ARSB", "GL", "SIG", "R&T"],
      required: true,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    address: {
      type: String,
      default: null,
      trim: true,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

studentProfileSchema.index({ studentId: 1 });
studentProfileSchema.index({ niveau: 1, filiere: 1 });

const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);

export default StudentProfile;