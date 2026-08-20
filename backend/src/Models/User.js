import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password_hash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "enseignant", "etudiant"],
      default: "etudiant",
    },
    student_id: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: 50,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    join_date: {
      type: Date,
      default: null,
    },
    teacher_type: {
      type: String,
      enum: ["permanent", "vacataire", null],
      default: null,
    },
    discipline: {
      type: String,
      maxlength: 100,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },

    niveau: {
      type: String,
      enum: ["L1", "L2", "L3", null],
      default: null,
    },
    filiere: {
      type: String,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const User = mongoose.model("User", userSchema);
export default User;
