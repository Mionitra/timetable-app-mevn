import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      default: null,
    },

    fileSize: {
      type: String,
      default: null,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

materialSchema.index({ subject: 1 });
materialSchema.index({ course: 1 });

const Material = mongoose.model("Material", materialSchema);

export default Material;