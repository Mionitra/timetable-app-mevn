import mongoose from "mongoose";

const coursSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    salle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salle",
      required: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day_of_week: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["CM", "TD", "TP"],
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Cours = mongoose.model("Cours", coursSchema);
export default Cours;
