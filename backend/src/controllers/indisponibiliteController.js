import Indisponibilite from "../Models/Indisponibilite.js";

// =====================================================
// HELPER : formater une indisponibilité Mongoose en objet propre
// =====================================================
const formatIndisponibilite = (i) => {
  return {
    id: i._id,
    teacherId: i.teacherId,
    dayOfWeek: i.dayOfWeek,
    slotIndex: i.slotIndex,
    createdAt: i.createdAt,
  };
};

// =====================================================
// GET /api/indisponibilites/me (enseignant, RF-TEACH-01)
// Toutes les indisponibilités récurrentes de l'enseignant connecté.
// Le teacherId vient TOUJOURS du token, jamais du client.
// =====================================================
export const getMyIndisponibilites = async (req, res) => {
  try {
    const indisponibilites = await Indisponibilite.find({
      teacherId: req.user.id,
    }).sort({ dayOfWeek: 1, slotIndex: 1 });

    return res.status(200).json(indisponibilites.map(formatIndisponibilite));
  } catch (error) {
    console.error("GetMyIndisponibilites Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// POST /api/indisponibilites (enseignant, RF-TEACH-01)
// Déclare une indisponibilité récurrente { dayOfWeek, slotIndex }
// =====================================================
export const createIndisponibilite = async (req, res) => {
  try {
    const { dayOfWeek, slotIndex } = req.body;

    // Validation stricte avant toute requête en base
    if (
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 1 ||
      dayOfWeek > 5
    ) {
      return res.status(400).json({
        message: "Le jour doit être un entier entre 1 (lundi) et 5 (vendredi)",
      });
    }

    if (!Number.isInteger(slotIndex) || slotIndex < 1 || slotIndex > 10) {
      return res.status(400).json({
        message: "Le créneau doit être un entier entre 1 et 10",
      });
    }

    try {
      const indisponibilite = await Indisponibilite.create({
        teacherId: req.user.id,
        dayOfWeek,
        slotIndex,
      });

      return res.status(201).json({
        message: "Indisponibilité ajoutée",
        indisponibilite: formatIndisponibilite(indisponibilite),
      });
    } catch (duplicateError) {
      if (duplicateError.code === 11000) {
        return res.status(409).json({
          message: "Cette indisponibilité est déjà déclarée",
        });
      }
      throw duplicateError;
    }
  } catch (error) {
    console.error("CreateIndisponibilite Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// DELETE /api/indisponibilites/:id (enseignant propriétaire)
// Suppression individuelle ; la vérification de propriété
// se fait en base via le teacherId du token.
// =====================================================
export const deleteIndisponibilite = async (req, res) => {
  try {
    const indisponibilite = await Indisponibilite.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user.id,
    });

    if (!indisponibilite) {
      return res.status(404).json({
        message: "Indisponibilité introuvable ou non autorisée",
      });
    }

    return res.status(200).json({
      message: "Indisponibilité supprimée",
    });
  } catch (error) {
    console.error("DeleteIndisponibilite Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
