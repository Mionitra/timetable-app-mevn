import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
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
  { weekNumber, year, dayOfWeek, slotIndex, type, duration },
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
  if (duration !== undefined) {
    // Optionnel : nombre de créneaux successifs (cours bloqués sur
    // plusieurs heures). Validé seulement s'il est fourni.
    if (!isPositiveInt(duration) || duration < 1 || duration > 10) {
      return "La durée doit être un entier entre 1 et 10 créneaux";
    }
  }
  return null;
};

/**
 * Normalise la durée d'un cours (créneaux successifs) et vérifie
 * que la plage ne déborde pas de la journée (créneau max = 10).
 * Retourne un message d'erreur ou null.
 */
const validateDurationRange = (slotIndex, duration) => {
  if (slotIndex + duration - 1 > 10) {
    return "Le cours s'étend au-delà du dernier créneau de la journée";
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
    sequenceId: c.sequenceId ?? null,
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
      duration,
      groupId,
      subjectId,
      teacherId,
      salleId,
      excludeId,
      excludeIds,
    } = req.body;

    const validationError = validateSlotPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const effectiveDuration =
      isPositiveInt(duration) && duration >= 1 ? duration : 1;

    const rangeError = validateDurationRange(slotIndex, effectiveDuration);
    if (rangeError) {
      return res.status(400).json({ message: rangeError });
    }

    if (!isValidObjectId(groupId) || !isValidObjectId(teacherId) || !isValidObjectId(salleId)) {
      return res.status(400).json({
        message: "Groupe, enseignant et salle sont obligatoires",
      });
    }

    // IDs à exclure : liste moderne excludeIds, fallback legacy excludeId
    let idsToExclude = [];
    if (Array.isArray(excludeIds)) {
      idsToExclude = excludeIds.filter(isValidObjectId);
    } else if (isValidObjectId(excludeId)) {
      idsToExclude = [excludeId];
    }

    const conflicts = await checkConflicts({
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      duration: effectiveDuration,
      salleId,
      teacherId,
      groupId,
      excludeIds: idsToExclude,
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
      duration,
    } = req.body;

    const validationError = validateSlotPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Créneaux successifs : durée par défaut = 1 créneau
    const effectiveDuration =
      isPositiveInt(duration) && duration >= 1 ? duration : 1;

    const rangeError = validateDurationRange(slotIndex, effectiveDuration);
    if (rangeError) {
      return res.status(400).json({ message: rangeError });
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
    // brouillon ou publié confondus (section 2.6). Vérification sur
    // TOUTE la plage de créneaux successifs.
    const conflicts = await checkConflicts({
      weekNumber,
      year,
      dayOfWeek,
      slotIndex,
      duration: effectiveDuration,
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

    // Un bloc multi-créneaux = N documents partageant le même
    // sequenceId ; un cours simple reste sans sequenceId (null).
    const sequenceId =
      effectiveDuration > 1 ? randomUUID() : null;

    const baseDoc = {
      weekNumber,
      year,
      dayOfWeek,
      type,
      groupId,
      subjectId,
      teacherId,
      salleId,
      isPublished: isPublished === true,
      sequenceId,
    };

    const docs = Array.from({ length: effectiveDuration }, (_, offset) => ({
      ...baseDoc,
      slotIndex: slotIndex + offset,
    }));

    try {
      const inserted = await Cours.insertMany(docs);

      const populated = await Cours.findById(inserted[0]._id).populate(
        POPULATE_FIELDS
      );

      return res.status(201).json({
        message:
          effectiveDuration > 1
            ? `Cours créé sur ${effectiveDuration} créneaux successifs`
            : "Cours créé avec succès",
        cours: formatCours(populated),
      });
    } catch (insertError) {
      if (insertError.code === 11000) {
        // Course aux créneaux perdue entre le check et l'insert :
        // nettoyage du bloc partiel pour ne pas laisser de tronc.
        if (sequenceId) {
          await Cours.deleteMany({ sequenceId });
        } else {
          await Cours.deleteOne({
            weekNumber,
            year,
            dayOfWeek,
            slotIndex,
            salleId,
          });
        }

        return res.status(409).json({
          error: "SCHEDULE_CONFLICT",
          message: "Salle déjà occupée sur l'un des créneaux",
          conflicts: [
            {
              type: "SALLE",
              message: "Salle déjà occupée sur l'un des créneaux",
            },
          ],
        });
      }
      throw insertError;
    }
  } catch (error) {
    console.error("CreateSlot Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PUT /api/slots/:id (admin)
// Modification avec contrôle de conflits (hors soi-même).
// Multi-créneaux : modifier n'importe quel document d'un bloc
// met à jour TOUTE la séquence (matière, enseignant, salle,
// type, publication). La durée reste inchangée.
// =====================================================
export const updateSlot = async (req, res) => {
  try {
    const existing = await Cours.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    // Résolution du bloc complet si le cours appartient à une
    // séquence de créneaux successifs
    const sequenceFilter = existing.sequenceId
      ? { sequenceId: existing.sequenceId }
      : { _id: existing._id };

    const sequenceDocs = await Cours.find(sequenceFilter).sort({
      slotIndex: 1,
    });

    const excludeIds = sequenceDocs.map((doc) => doc._id.toString());

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

    // Le bloc occupe `sequenceDocs.length` créneaux consécutifs :
    // re-vérification sur toute la plage hors documents édités.
    const rangeError = validateDurationRange(
      payload.slotIndex,
      sequenceDocs.length
    );
    if (rangeError) {
      return res.status(400).json({ message: rangeError });
    }

    const referenceError = await validateReferences(payload);
    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    const conflicts = await checkConflicts({
      ...payload,
      duration: sequenceDocs.length,
      excludeIds,
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: "SCHEDULE_CONFLICT",
        message: "Des conflits ont été détectés sur ce créneau",
        conflicts,
      });
    }

    const sharedUpdate = {
      type: payload.type,
      groupId: payload.groupId,
      subjectId: payload.subjectId,
      teacherId: payload.teacherId,
      salleId: payload.salleId,
      isPublished: req.body.isPublished ?? existing.isPublished,
    };

    await Cours.updateMany(sequenceFilter, sharedUpdate);

    const populated = await Cours.findById(existing._id).populate(
      POPULATE_FIELDS
    );

    return res.status(200).json({
      message:
        sequenceDocs.length > 1
          ? `Bloc de ${sequenceDocs.length} créneaux mis à jour`
          : "Cours mis à jour",
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
// Multi-créneaux : supprime TOUTE la séquence d'un coup.
// =====================================================
export const deleteSlot = async (req, res) => {
  try {
    const existing = await Cours.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    let deletedCount = 1;

    if (existing.sequenceId) {
      const result = await Cours.deleteMany({
        sequenceId: existing.sequenceId,
      });
      deletedCount = result.deletedCount;
    } else {
      await existing.deleteOne();
    }

    return res.status(200).json({
      message:
        deletedCount > 1
          ? `Bloc de ${deletedCount} créneaux supprimé`
          : "Cours supprimé",
      deletedCount,
    });
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
