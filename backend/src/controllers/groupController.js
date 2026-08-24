import Group from "../Models/Group.js";

// =====================================================
// HELPERS
// =====================================================

const formatGroup = (g) => ({
  id: g._id,
  name: g.name,
  promotion: g.promotion,
  effectifIndicatif: g.effectifIndicatif,
});

// =====================================================
// GET /api/groupes (admin)
// Liste des groupes actifs
// =====================================================
export const getGroupes = async (req, res) => {
  try {
    const groupes = await Group.find({ isArchived: false }).sort({
      name: 1,
    });

    return res.status(200).json(groupes.map(formatGroup));
  } catch (error) {
    console.error("GetGroupes Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// GET /api/groupes/public (public)
// Liste minimale (id + nom) pour le formulaire d'inscription
// étudiante (RF-AUTH-01 : sélection du groupe cible)
// =====================================================
export const getPublicGroupes = async (req, res) => {
  try {
    const groupes = await Group.find({ isArchived: false })
      .select("name promotion")
      .sort({ name: 1 });

    return res.status(200).json(groupes.map(formatGroup));
  } catch (error) {
    console.error("GetPublicGroupes Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// POST /api/groupes (admin)
// =====================================================
export const createGroupe = async (req, res) => {
  try {
    const { name, promotion, effectifIndicatif } = req.body;

    if (!name || !promotion) {
      return res.status(400).json({
        message: "Le nom et la promotion sont obligatoires",
      });
    }

    const groupe = await Group.create({
      name: name.trim(),
      promotion: promotion.trim(),
      effectifIndicatif:
        Number.isInteger(effectifIndicatif) && effectifIndicatif > 0
          ? effectifIndicatif
          : null,
    });

    return res.status(201).json({
      message: "Groupe créé avec succès",
      groupe: formatGroup(groupe),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Un groupe porte déjà ce nom",
      });
    }

    console.error("CreateGroupe Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PUT /api/groupes/:id (admin)
// =====================================================
export const updateGroupe = async (req, res) => {
  try {
    const { name, promotion, effectifIndicatif } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (promotion !== undefined) updateData.promotion = promotion.trim();
    if (effectifIndicatif !== undefined) {
      updateData.effectifIndicatif =
        Number.isInteger(effectifIndicatif) && effectifIndicatif > 0
          ? effectifIndicatif
          : null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    const groupe = await Group.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!groupe) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    return res.status(200).json({
      message: "Groupe mis à jour",
      groupe: formatGroup(groupe),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Un groupe porte déjà ce nom",
      });
    }

    console.error("UpdateGroupe Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// DELETE /api/groupes/:id (admin)
// Soft delete : préserve l'historique des cours (section 3.1)
// =====================================================
export const deleteGroupe = async (req, res) => {
  try {
    const groupe = await Group.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!groupe) {
      return res.status(404).json({ message: "Groupe introuvable" });
    }

    return res.status(200).json({
      message: "Groupe archivé",
      groupe: formatGroup(groupe),
    });
  } catch (error) {
    console.error("DeleteGroupe Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
