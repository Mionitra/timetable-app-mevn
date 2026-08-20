import mongoose from "mongoose";

const alerteSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["salle_occupee", "prof_indisponible", "conflit_horaire", "autre"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    cours_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
      default: null,
    },
    salle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salle",
      default: null,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

const Alerte = mongoose.model("Alerte", alerteSchema);
export default Alerte;
