import mongoose from "mongoose";
import Cours from "../Models/Cours.js";


// =====================================================
// GET /api/admin/cours
// Récupérer tous les cours
// =====================================================
export const getCours = async (req, res) => {
  try {
    const cours = await Cours.find()
      .populate("subject_id", "name code")
      .populate("group_id", "name code niveau filiere")
      .populate("salle_id", "name")
      .populate("teacher_id", "first_name last_name email")
      .sort({
        day_of_week: 1,
        start_time: 1,
      });

    return res.status(200).json({
      success: true,
      data: cours,
    });
  } catch (error) {
    console.error("Erreur GET cours :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des cours",
      error: error.message,
    });
  }
};


// =====================================================
// GET /api/admin/cours/:id
// Récupérer un cours
// =====================================================
export const getCoursById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID du cours invalide",
      });
    }

    const cours = await Cours.findById(id)
      .populate("subject_id", "name code")
      .populate("group_id", "name code niveau filiere")
      .populate("salle_id", "name")
      .populate("teacher_id", "first_name last_name email");

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable",
      });
    }

    return res.status(200).json({
      success: true,
      data: cours,
    });
  } catch (error) {
    console.error("Erreur GET cours/:id :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du cours",
      error: error.message,
    });
  }
};


// =====================================================
// POST /api/admin/cours
// Créer un cours
// =====================================================
export const createCours = async (req, res) => {
  try {
    console.log("Données reçues pour création cours :", req.body);

    const {
      subject_id,
      group_id,
      salle_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
      start_date,
      end_date,
      type,
      description,
    } = req.body;


    // -----------------------------------------------
    // Vérification des champs obligatoires
    // -----------------------------------------------
    const missingFields = [];

    if (!subject_id) missingFields.push("subject_id");
    if (!group_id) missingFields.push("group_id");
    if (!salle_id) missingFields.push("salle_id");
    if (!teacher_id) missingFields.push("teacher_id");
    if (!day_of_week) missingFields.push("day_of_week");
    if (!start_time) missingFields.push("start_time");
    if (!end_time) missingFields.push("end_time");
    if (!start_date) missingFields.push("start_date");
    if (!end_date) missingFields.push("end_date");
    if (!type) missingFields.push("type");


    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Champs obligatoires manquants : ${missingFields.join(", ")}`,
      });
    }


    // -----------------------------------------------
    // Vérification des ObjectId
    // -----------------------------------------------
    const ids = {
      subject_id,
      group_id,
      salle_id,
      teacher_id,
    };

    for (const [field, value] of Object.entries(ids)) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} contient un ID MongoDB invalide`,
        });
      }
    }


    // -----------------------------------------------
    // Vérification du jour
    // -----------------------------------------------
    const day = Number(day_of_week);

    if (day < 1 || day > 7) {
      return res.status(400).json({
        success: false,
        message: "Le jour doit être compris entre 1 et 7",
      });
    }


    // -----------------------------------------------
    // Vérification des heures
    // -----------------------------------------------
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: "L'heure de début doit être avant l'heure de fin",
      });
    }


    // -----------------------------------------------
    // Vérification des dates
    // -----------------------------------------------
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Date invalide",
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "La date de début doit être avant la date de fin",
      });
    }


    // -----------------------------------------------
    // Création
    // -----------------------------------------------
    const cours = await Cours.create({
      subject_id,
      group_id,
      salle_id,
      teacher_id,
      day_of_week: day,
      start_time,
      end_time,
      start_date: startDate,
      end_date: endDate,
      type,
      description: description || "",
    });


    // -----------------------------------------------
    // Récupérer avec populate
    // -----------------------------------------------
    const coursCreated = await Cours.findById(cours._id)
      .populate("subject_id", "name code")
      .populate("group_id", "name code niveau filiere")
      .populate("salle_id", "name")
      .populate("teacher_id", "first_name last_name email");


    return res.status(201).json({
      success: true,
      message: "Cours créé avec succès",
      data: coursCreated,
    });

  } catch (error) {
    console.error("Erreur CREATE cours :", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation du cours",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du cours",
      error: error.message,
    });
  }
};


// =====================================================
// PUT /api/admin/cours/:id
// Modifier un cours
// =====================================================
export const updateCours = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID du cours invalide",
      });
    }


    const {
      subject_id,
      group_id,
      salle_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
      start_date,
      end_date,
      type,
      description,
    } = req.body;


    if (!subject_id) {
      return res.status(400).json({
        success: false,
        message: "subject_id est obligatoire",
      });
    }

    if (!group_id) {
      return res.status(400).json({
        success: false,
        message: "group_id est obligatoire",
      });
    }

    if (!salle_id) {
      return res.status(400).json({
        success: false,
        message: "salle_id est obligatoire",
      });
    }

    if (!teacher_id) {
      return res.status(400).json({
        success: false,
        message: "teacher_id est obligatoire",
      });
    }


    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: "L'heure de début doit être avant l'heure de fin",
      });
    }


    const cours = await Cours.findByIdAndUpdate(
      id,
      {
        subject_id,
        group_id,
        salle_id,
        teacher_id,
        day_of_week,
        start_time,
        end_time,
        start_date,
        end_date,
        type,
        description: description || "",
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("subject_id", "name code")
      .populate("group_id", "name code niveau filiere")
      .populate("salle_id", "name")
      .populate("teacher_id", "first_name last_name email");


    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Cours modifié avec succès",
      data: cours,
    });

  } catch (error) {
    console.error("Erreur UPDATE cours :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du cours",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE /api/admin/cours/:id
// Supprimer un cours
// =====================================================
export const deleteCours = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID du cours invalide",
      });
    }


    const cours = await Cours.findByIdAndDelete(id);

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Cours supprimé avec succès",
    });

  } catch (error) {
    console.error("Erreur DELETE cours :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du cours",
      error: error.message,
    });
  }
};