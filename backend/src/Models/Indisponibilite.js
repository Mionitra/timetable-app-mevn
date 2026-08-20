import mongoose from "mongoose";

const indisponibiliteSchema = new mongoose.Schema(
  {
    user_id: {

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
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Indisponibilite = mongoose.model("Indisponibilite", indisponibiliteSchema);
export default Indisponibilite;
