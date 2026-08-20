import Alerte from "../Models/Alerte.js";

// =====================================================
// GET toutes les alertes (pour l'utilisateur connecté)
// =====================================================
export const getAlertes = async (req, res) => {
  try {
    const alertes = await Alerte.find()
      .populate("cours_id", "day_of_week start_time end_time")
      .populate("salle_id", "name")
      .populate("user_id", "first_name last_name")
      .sort({ created_at: -1 })
      .limit(50);

    return res.status(200).json(alertes);
  } catch (error) {
    console.error("GetAlertes Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PATCH marquer une alerte comme lue
// =====================================================
export const markAsRead = async (req, res) => {
  try {
    const alerte = await Alerte.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );

    if (!alerte) {
      return res.status(404).json({ message: "Alerte introuvable" });
    }

    return res.status(200).json({ message: "Alerte marquée comme lue", alerte });
  } catch (error) {
    console.error("MarkAsRead Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PATCH marquer TOUTES les alertes comme lues
// =====================================================
export const markAllAsRead = async (req, res) => {
  try {
    await Alerte.updateMany({ is_read: false }, { is_read: true });
    return res.status(200).json({ message: "Toutes les alertes marquées comme lues" });
  } catch (error) {
    console.error("MarkAllAsRead Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
