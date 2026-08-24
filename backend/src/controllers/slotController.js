import mongoose from "mongoose";
import Cours from "../Models/Cours.js";
import Group from "../Models/Group.js";
import Matiere from "../Models/Matiere.js";
import Salle from "../Models/Salle.js";
import User from "../Models/User.js";
import { checkConflicts } from "../services/conflictChecker.js";

// =====================================================
// HELPERS : validation d'entrée (section 6 - Validation)
// =====================================================

const isPositiveInt = (value) => Number.isInteger(value);

const isValidObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

/**
 * Valide un payload de créneau. Retourne un message d'erreur
 * ou null si le payload est cohérent.
 */
const validateSlotPayload = (
  { weekNumber, year, dayOfWeek, slotIndex, type },
  { partial = false } = {}
) => {
  if (!partial || weekNumber !== undefined) {
    if (!isPositiveInt(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      return "Le numéro de semaine doit être un entier entre 1 et 53";
    }
  }
  if (!partial || year !== undefined) {
    if (!isPositiveInt(year) || year < 2000 || year > 2100) {
      return "L'année est invalide";
    }
  }
  if (!partial || dayOfWeek !== undefined) {
    if (!isPositiveInt(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 5) {
      return "Le jour doit être un entier entre 1 (lundi) et 5 (vendredi)";
    }
  }
  if (!partial || slotIndex !== undefined) {
    if (!isPositiveInt(slotIndex) || slotIndex < 1 || slotIndex > 10) {
      return "Le créneau doit être un entier entre 1 et 10";
    }
  }
  if (!partial || type !== undefined) {
    if (!["CM", "TD", "TP"].includes(type)) {
      return "Le type de cours doit être CM, TD ou TP";
    }
  }
  return null;
};

// =====================================================
// HELPER : formater un cours Mongoose en objet propre
// =====================================================
const formatCours = (c) => {
  return {
    id: c._id,
    weekNumber: c.weekNumber,
    year: c.year,
    dayOfWeek: c.dayOfWeek,
    slotIndex: c.slotIndex,
    type: c.type,
    isPublished: c.isPublished,
    group: c.groupId
      ? { id: c.groupId._id, name: c.groupId.name }
      : null,
    subject: c.subjectId
      ? { id: c.subjectId._id, name: c.subjectId.name, semester: c.subjectId.semester }
      : null,
    teacher: c.teacherId
      ? {
          id: c.teacherId._id,
          firstName: c.teacherId.firstName,
          lastName: c.teacherId.lastName,
        }
      : null,
    salle: c.salleId
      ? { id: c.salleId._id, name: c.salleId.name }
      : null,
  };
};

const POPULATE_FIELDS = [
  { path: "groupId", select: "name promotion" },
  { path: "subjectId", select: "name semester" },
  { path: "teacherId", select: "firstName lastName" },
  { path: "salleId", select: "name capacite" },
];

// Vérifie que les référentiels ciblés existent et sont actifs.
// Retourne un message d'erreur ou null.
const validateReferences = async ({ groupId, subjectId, teacherId, salleId }) => {
  const [group, matiere, teacher, salle] = await Promise.all([
    Group.findOne({ _id: groupId, isArchived: false }),
    Matiere.findOne({ _id: subjectId, isArchived: false }),
    User.findOne({ _id: teacherId, role: "enseignant", isActive: true }),
    Salle.findOne({ _id: salleId, isArchived: false }),
  ]);

  if (!group) return "Groupe introuvable ou archivé";
  if (!matiere) return "Matière introuvable ou archivée";
  if (!teacher) return "Enseignant introuvable ou inactif";
  if (!salle) return "Salle introuvable ou archivée";
  return null;
};

// =====================================================
// POST /api/slots/check-conflict (admin)
// Vérification à la volée, sans écriture (section 2.6)
// =====================================================
export const checkConflict = async (req, res) => {
  try {
    const {
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      groupId,
      subjectId,
      teacherId,
      salleId,
      excludeId,
    } = req.body;

    const validationError = validateSlotPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!isValidObjectId(groupId) || !isValidObjectId(teacherId) || !isValidObjectId(salleId)) {
      return res.status(400).json({
        message: "Groupe, enseignant et salle sont obligatoires",
      });
    }

    const conflicts = await checkConflicts({
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      salleId,
      teacherId,
      groupId,
      excludeId: isValidObjectId(excludeId) ? excludeId : null,
    });

    return res.status(200).json({ conflicts });
  } catch (error) {
    console.error("CheckConflict Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// POST /api/slots (admin)
// Création avec contrôle de conflits bloquant (section 2.6)
// =====================================================
export const createSlot = async (req, res) => {
  try {
    const {
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      type,
      groupId,
      subjectId,
      teacherId,
      salleId,
      isPublished,
    } = req.body;

    const validationError = validateSlotPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (
      !isValidObjectId(groupId) ||
      !isValidObjectId(subjectId) ||
      !isValidObjectId(teacherId) ||
      !isValidObjectId(salleId)
    ) {
      return res.status(400).json({
        message: "Groupe, matière, enseignant et salle sont obligatoires",
      });
    }

    // Référentiels valides avant tout contrôle de conflit
    const referenceError = await validateReferences({
      groupId,
      subjectId,
      teacherId,
      salleId,
    });

    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    // Règle absolue : aucune écriture ne peut créer un conflit,
    // brouillon ou publié confondus (section 2.6)
    const conflicts = await checkConflicts({
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      salleId,
      teacherId,
      groupId,
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: "SCHEDULE_CONFLICT",
        message: "Des conflits ont été détectés sur ce créneau",
        conflicts,
      });
    }

    const cours = await Cours.create({
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      type,
      groupId,
      subjectId,
      teacherId,
      salleId,
      isPublished: isPublished === true,
    });

    const populated = await Cours.findById(cours._id).populate(
      POPULATE_FIELDS
    );

    return res.status(201).json({
      message: "Cours créé avec succès",
      cours: formatCours(populated),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "SCHEDULE_CONFLICT",
        message: "Salle déjà occupée à ce créneau",
        conflicts: [
          { type: "SALLE", message: "Salle déjà occupée à ce créneau" },
        ],
      });
    }

    console.error("CreateSlot Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PUT /api/slots/:id (admin)
// Modification avec contrôle de conflits (hors soi-même)
// =====================================================
export const updateSlot = async (req, res) => {
  try {
    const existing = await Cours.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    const payload = {
      weekNumber: req.body.weekNumber ?? existing.weekNumber,
      year: req.body.year ?? existing.year,
      dayOfWeek: req.body.dayOfWeek ?? existing.dayOfWeek,
      slotIndex: req.body.slotIndex ?? existing.slotIndex,
      type: req.body.type ?? existing.type,
      groupId: req.body.groupId ?? existing.groupId.toString(),
      subjectId: req.body.subjectId ?? existing.subjectId.toString(),
      teacherId: req.body.teacherId ?? existing.teacherId.toString(),
      salleId: req.body.salleId ?? existing.salleId.toString(),
    };

    const validationError = validateSlotPayload(payload);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (
      !isValidObjectId(payload.groupId) ||
      !isValidObjectId(payload.subjectId) ||
      !isValidObjectId(payload.teacherId) ||
      !isValidObjectId(payload.salleId)
    ) {
      return res.status(400).json({
        message: "Références invalides",
      });
    }

    const referenceError = await validateReferences(payload);
    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    const conflicts = await checkConflicts({
      ...payload,
      excludeId: existing._id.toString(),
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: "SCHEDULE_CONFLICT",
        message: "Des conflits ont été détectés sur ce créneau",
        conflicts,
      });
    }

    Object.assign(existing, payload, {
      isPublished: req.body.isPublished ?? existing.isPublished,
    });

    await existing.save();

    const populated = await Cours.findById(existing._id).populate(
      POPULATE_FIELDS
    );

    return res.status(200).json({
      message: "Cours mis à jour",
      cours: formatCours(populated),
    });
  } catch (error) {
    console.error("UpdateSlot Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// DELETE /api/slots/:id (admin)
// Suppression physique autorisée : un cours n'est jamais
// référencé par une autre collection.
// =====================================================
export const deleteSlot = async (req, res) => {
  try {
    const cours = await Cours.findByIdAndDelete(req.params.id);

    if (!cours) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    return res.status(200).json({ message: "Cours supprimé" });
  } catch (error) {
    console.error("DeleteSlot Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PATCH /api/slots/publish-week (admin)
// Publie tous les slots d'un groupe/semaine en une opération
// atomique quand l'environnement le permet (replica set) ;
// sinon fallback documenté sans atomicité stricte (section 6).
// Body : { groupId, weekNumber, year }
// =====================================================
export const publishWeek = async (req, res) => {
  try {
    const { groupId, weekNumber, year } = req.body;

    const validationError = validateSlotPayload({
      weekNumber,
      year,
      dayOfWeek: 1,
      slotIndex: 1,
      type: "CM",
    });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Groupe invalide" });
    }

    const filter = { groupId, weekNumber, year };

    try {
      // Environnement avec replica set : atomicité stricte
      const session = await mongoose.startSession();
      let modifiedCount = 0;

      await session.withTransaction(async () => {
        const result = await Cours.updateMany(
          filter,
          { isPublished: true },
          { session }
        );
        modifiedCount = result.modifiedCount;
      });

      await session.endSession();

      return res.status(200).json({
        message: `${modifiedCount} cours publiés pour la semaine ${weekNumber}`,
        modifiedCount,
      });
    } catch (transactionError) {
      // Environnement MongoDB local standalone (pas de replica set) :
      // pas d'atomicité stricte possible, mise à jour simple documentée.
      console.warn(
        "publishWeek : transaction indisponible, fallback updateMany simple"
      );

      const result = await Cours.updateMany(filter, { isPublished: true });

      return res.status(200).json({
        message: `${result.modifiedCount} cours publiés pour la semaine ${weekNumber}`,
        modifiedCount: result.modifiedCount,
      });
    }
  } catch (error) {
    console.error("PublishWeek Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// GET /api/slots?groupId=&weekNumber=&year=
// admin : n'importe quel groupe, brouillons + publiés
// étudiant : groupe dérivé du TOKEN uniquement, publiés seuls
// (RF-STUD-02 : jamais confiance au groupId client)
// =====================================================
export const getGrid = async (req, res) => {
  try {
    const { groupId, weekNumber, year } = req.query;

    if (
      !isPositiveInt(Number(weekNumber)) ||
      Number(weekNumber) < 1 ||
      Number(weekNumber) > 53 ||
      !isPositiveInt(Number(year))
    ) {
      return res.status(400).json({
        message: "Paramètres weekNumber et year requis et valides",
      });
    }

    const filter = {
      weekNumber: Number(weekNumber),
      year: Number(year),
    };

    if (req.user.role === "etudiant") {
      // Sécurité : le groupe vient TOUJOURS du token côté backend
      const student = await User.findById(req.user.id).select("groupId");

      if (!student || !student.groupId) {
        return res.status(200).json([]);
      }

      filter.groupId = student.groupId;
      filter.isPublished = true;
    } else if (req.user.role === "admin") {
      if (!isValidObjectId(groupId)) {
        return res.status(400).json({ message: "Paramètre groupId requis" });
      }
      filter.groupId = groupId;
    } else {
      // Les enseignants passent par /api/slots/me
      return res.status(403).json({ message: "Accès interdit" });
    }

    const cours = await Cours.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ dayOfWeek: 1, slotIndex: 1 });

    return res.status(200).json(cours.map(formatCours));
  } catch (error) {
    console.error("GetGrid Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// GET /api/slots/me?weekNumber=&year= (enseignant, RF-TEACH-02)
// Planning personnel publié ; semaine filtrable optionnellement
// =====================================================
export const getMySchedule = async (req, res) => {
  try {
    const { weekNumber, year } = req.query;

    // Le teacherId vient TOUJOURS du token
    const filter = {
      teacherId: req.user.id,
      isPublished: true,
    };

    if (weekNumber !== undefined && year !== undefined) {
      if (
        !isPositiveInt(Number(weekNumber)) ||
        Number(weekNumber) < 1 ||
        Number(weekNumber) > 53 ||
        !isPositiveInt(Number(year))
      ) {
        return res.status(400).json({
          message: "Paramètres weekNumber et year invalides",
        });
      }

      filter.weekNumber = Number(weekNumber);
      filter.year = Number(year);
    }

    const cours = await Cours.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ dayOfWeek: 1, slotIndex: 1 });

    return res.status(200).json(cours.map(formatCours));
  } catch (error) {
    console.error("GetMySchedule Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
