import User from "../Models/User.js";
import bcrypt from "bcryptjs";

/* ================================================================
   ENSEIGNANTS
================================================================ */

// GET /api/admin/enseignants
export const getEnseignants = async (req, res) => {
  try {
    const enseignants = await User.find({ role: "enseignant" })
      .select("-password_hash")
      .sort({ last_name: 1 });

    res.json({ success: true, data: enseignants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// POST /api/admin/enseignants
export const createEnseignant = async (req, res) => {
  try {
    const { first_name, last_name, email, password, teacher_type, discipline } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email déjà utilisé" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      first_name, last_name, email, password_hash,
      role: "enseignant",
      teacher_type: teacher_type || "permanent",
      discipline: discipline || null,
    });

    const { password_hash: _, ...userObj } = user.toObject();
    res.status(201).json({ success: true, data: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/enseignants/:id
export const updateEnseignant = async (req, res) => {
  try {
    const { first_name, last_name, email, password, teacher_type, discipline } = req.body;

    const updateData = { first_name, last_name, email, teacher_type, discipline };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password_hash");

    if (!user) {
      return res.status(404).json({ success: false, message: "Enseignant introuvable" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/enseignants/:id
export const deleteEnseignant = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Enseignant introuvable" });
    }
    res.json({ success: true, message: "Enseignant supprimé" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
