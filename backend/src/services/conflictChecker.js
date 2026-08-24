import Cours from "../Models/Cours.js";
import Indisponibilite from "../Models/Indisponibilite.js";

// =========================================================
// SOURCE DE VÉRITÉ UNIQUE de la détection de conflits
// (section 2.6). Appelé par POST /api/slots/check-conflict
// et en interne avant tout POST/PUT /api/slots.
// Retourne TOUS les conflits, jamais seulement le premier.
// =========================================================

/**
 * Vérifie salle / enseignant / indisponibilité / groupe pour le
 * triplet (weekNumber, year, dayOfWeek, slotIndex) cible.
 *
 * @param {Object} payload
 * @param {Number} payload.weekNumber  1-53
 * @param {Number} payload.year        ex: 2026
 * @param {Number} payload.dayOfWeek   1-5
 * @param {Number} payload.slotIndex   1-10
 * @param {String} payload.salleId
 * @param {String} payload.teacherId
 * @param {String} payload.groupId
 * @param {String|null} [payload.excludeId] _id du cours en cours d'édition
 * @returns {Promise<Array<{type: String, message: String}>>}
 */
export const checkConflicts = async ({
  weekNumber,
  year,
  dayOfWeek,
  slotIndex,
  salleId,
  teacherId,
  groupId,
  excludeId = null,
}) => {
  const conflicts = [];

  // Filtre commun sur le créneau cible, en excluant le document édité
  const creneauFilter = { weekNumber, year, dayOfWeek, slotIndex };
  if (excludeId) {
    creneauFilter._id = { $ne: excludeId };
  }

  const [salleConflict, teacherConflict, groupConflict, indisponibilite] =
    await Promise.all([
      Cours.findOne({ ...creneauFilter, salleId }),
      Cours.findOne({ ...creneauFilter, teacherId }),
      Cours.findOne({ ...creneauFilter, groupId }),
      Indisponibilite.findOne({ teacherId, dayOfWeek, slotIndex }),
    ]);

  if (salleConflict) {
    conflicts.push({
      type: "SALLE",
      message: "Salle déjà occupée à ce créneau",
    });
  }

  if (indisponibilite) {
    conflicts.push({
      type: "TEACHER_UNAVAILABLE",
      message: "Enseignant déclaré indisponible sur ce créneau",
    });
  }

  if (teacherConflict) {
    conflicts.push({
      type: "ENSEIGNANT",
      message: "Enseignant déjà occupé à ce créneau",
    });
  }

  if (groupConflict) {
    conflicts.push({
      type: "GROUPE",
      message: "Le groupe a déjà un cours à ce créneau",
    });
  }

  return conflicts;
};
