import mongoose from "mongoose";

const salleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    capacite: {
      type: Number,
      required: true,
    },
    is_occupied: {
      type: Boolean,
      default: false,
    },
    batiment: {
      type: String,
      maxlength: 50,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Salle = mongoose.model("Salle", salleSchema);
export default Salle;
