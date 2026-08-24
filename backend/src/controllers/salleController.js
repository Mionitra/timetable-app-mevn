import Salle from "../Models/Salle.js";

// =====================================================
// HELPERS
// =====================================================

const formatSalle = (s) => ({
  id: s._id,
  name: s.name,
  capacite: s.capacite,
  batiment: s.batiment,
});

// =====================================================
// GET /api/salles (admin, enseignant)
// Liste des salles actives (RF-ADMIN-01)
// =====================================================
export const getSalles = async (req, res) => {
  try {
    const salles = await Salle.find({ isArchived: false }).sort({
      name: 1,
    });

    return res.status(200).json(salles.map(formatSalle));
  } catch (error) {
    console.error("GetSalles Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// POST /api/salles (admin)
// =====================================================
export const createSalle = async (req, res) => {
  try {
    const { name, capacite, batiment } = req.body;

    if (!name || !capacite) {
      return res.status(400).json({
        message: "Le nom et la capacité sont obligatoires",
      });
    }

    if (!Number.isInteger(capacite) || capacite < 1) {
      return res.status(400).json({
        message: "La capacité doit être un entier supérieur à 0",
      });
    }

    const salle = await Salle.create({
      name: name.trim(),
      capacite,
      batiment: batiment || null,
    });

    return res.status(201).json({
      message: "Salle créée avec succès",
      salle: formatSalle(salle),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Une salle porte déjà ce nom",
      });
    }

    console.error("CreateSalle Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PUT /api/salles/:id (admin)
// =====================================================
export const updateSalle = async (req, res) => {
  try {
    const { name, capacite, batiment } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (batiment !== undefined) updateData.batiment = batiment;
    if (capacite !== undefined) {
      if (!Number.isInteger(capacite) || capacite < 1) {
        return res.status(400).json({
          message: "La capacité doit être un entier supérieur à 0",
        });
      }
      updateData.capacite = capacite;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    const salle = await Salle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!salle) {
      return res.status(404).json({ message: "Salle introuvable" });
    }

    return res.status(200).json({
      message: "Salle mise à jour",
      salle: formatSalle(salle),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Une salle porte déjà ce nom",
      });
    }

    console.error("UpdateSalle Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// DELETE /api/salles/:id (admin)
// Soft delete : préserve l'historique des cours (section 3.1)
// =====================================================
export const deleteSalle = async (req, res) => {
  try {
    const salle = await Salle.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!salle) {
      return res.status(404).json({ message: "Salle introuvable" });
    }

    return res.status(200).json({
      message: "Salle archivée",
      salle,
    });
  } catch (error) {
    console.error("DeleteSalle Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
