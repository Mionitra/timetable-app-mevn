import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    targetAudience: {
      type: String,
      enum: ["all", "etudiant", "enseignant"],
      default: "etudiant",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model(
  "Announcement",
  announcementSchema
);

export default Announcement;