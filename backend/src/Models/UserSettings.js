import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "dark",
    },

    language: {
      type: String,
      enum: ["fr", "en", "mg"],
      default: "fr",
    },

    compactView: {
      type: Boolean,
      default: false,
    },

    notifCourseChanges: {
      type: Boolean,
      default: true,
    },

    notifNewGrades: {
      type: Boolean,
      default: true,
    },

    notifAnnouncements: {
      type: Boolean,
      default: true,
    },

    notifEmailDigest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserSettings = mongoose.model(
  "UserSettings",
  userSettingsSchema
);

export default UserSettings;