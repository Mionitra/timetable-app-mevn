import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    // =====================================================
    // INFORMATIONS
    // =====================================================

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 255,
    },

    promotion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    effectifIndicatif: {
      type: Number,
      default: null,
      min: 0,
    },

    // =====================================================
    // SOFT DELETE
    // =====================================================

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// MODEL
// =========================================================

const Group = mongoose.model("Group", groupSchema);

export default Group;
