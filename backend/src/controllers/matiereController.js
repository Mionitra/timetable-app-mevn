import Matiere from "../Models/Matiere.js";

// =====================================================
// HELPERS
// =====================================================

const formatMatiere = (m) => ({
  id: m._id,
  name: m.name,
  semester: m.semester,
  volumeHoraireCreneaux: m.volumeHoraireCreneaux,
});

// =====================================================
// GET /api/matieres (admin)
// Liste des matières actives
// =====================================================
export const getMatieres = async (req, res) => {
  try {
    const matieres = await Matiere.find({ isArchived: false }).sort({
      name: 1,
    });

    return res.status(200).json(matieres.map(formatMatiere));
  } catch (error) {
    console.error("GetMatieres Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// POST /api/matieres (admin)
// =====================================================
export const createMatiere = async (req, res) => {
  try {
    const { name, semester, volumeHoraireCreneaux } = req.body;

    if (!name || !semester) {
      return res.status(400).json({
        message: "Le nom et le semestre sont obligatoires",
      });
    }

    const matiere = await Matiere.create({
      name: name.trim(),
      semester: semester.trim(),
      volumeHoraireCreneaux:
        Number.isInteger(volumeHoraireCreneaux) && volumeHoraireCreneaux > 0
          ? volumeHoraireCreneaux
          : null,
    });

    return res.status(201).json({
      message: "Matière créée avec succès",
      matiere: formatMatiere(matiere),
    });
  } catch (error) {
    console.error("CreateMatiere Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PUT /api/matieres/:id (admin)
// =====================================================
export const updateMatiere = async (req, res) => {
  try {
    const { name, semester, volumeHoraireCreneaux } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (semester !== undefined) updateData.semester = semester.trim();
    if (volumeHoraireCreneaux !== undefined) {
      updateData.volumeHoraireCreneaux =
        Number.isInteger(volumeHoraireCreneaux) && volumeHoraireCreneaux > 0
          ? volumeHoraireCreneaux
          : null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    const matiere = await Matiere.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!matiere) {
      return res.status(404).json({ message: "Matière introuvable" });
    }

    return res.status(200).json({
      message: "Matière mise à jour",
      matiere: formatMatiere(matiere),
    });
  } catch (error) {
    console.error("UpdateMatiere Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// DELETE /api/matieres/:id (admin)
// Soft delete : préserve l'historique des cours (section 3.1)
// =====================================================
export const deleteMatiere = async (req, res) => {
  try {
    const matiere = await Matiere.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!matiere) {
      return res.status(404).json({ message: "Matière introuvable" });
    }

    return res.status(200).json({
      message: "Matière archivée",
      matiere: formatMatiere(matiere),
    });
  } catch (error) {
    console.error("DeleteMatiere Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
