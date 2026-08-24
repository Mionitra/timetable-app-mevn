import Cours from "../Models/Cours.js";
import Indisponibilite from "../Models/Indisponibilite.js";

// =========================================================
// SOURCE DE VÉRITÉ UNIQUE de la détection de conflits
// (section 2.6). Appelé par POST /api/slots/check-conflict
// et en interne avant tout POST/PUT /api/slots.
// Retourne TOUS les conflits, jamais seulement le premier.
// Supporte les cours sur créneaux successifs via `duration` :
// chaque créneau de la plage [slotIndex, slotIndex + duration - 1]
// est vérifié indépendamment.
// =========================================================

/**
 * @param {Object} payload
 * @param {Number} payload.weekNumber  1-53
 * @param {Number} payload.year        ex: 2026
 * @param {Number} payload.dayOfWeek   1-5
 * @param {Number} payload.slotIndex   1-10 (début de la plage)
 * @param {Number} [payload.duration]  nombre de créneaux successifs (défaut 1)
 * @param {String} payload.salleId
 * @param {String} payload.teacherId
 * @param {String} payload.groupId
 * @param {Array<String>} [payload.excludeIds] _ids à ignorer (cours en cours d'édition)
 * @returns {Promise<Array<{type: String, message: String}>>}
 */
export const checkConflicts = async ({
  weekNumber,
  year,
  dayOfWeek,
  slotIndex,
  duration = 1,
  salleId,
  teacherId,
  groupId,
  excludeIds = [],
}) => {
  const conflicts = [];

  // Filtre commun sur le créneau cible, en excluant les documents édités
  const creneauFilter = { weekNumber, year, dayOfWeek };
  if (excludeIds.length > 0) {
    creneauFilter._id = { $nin: excludeIds };
  }

  for (let offset = 0; offset < duration; offset++) {
    const index = slotIndex + offset;
    const suffix = duration > 1 ? ` (créneau ${index})` : "";
    const filter = { ...creneauFilter, slotIndex: index };

    const [salleConflict, teacherConflict, groupConflict, indisponibilite] =
      await Promise.all([
        Cours.findOne({ ...filter, salleId }),
        Cours.findOne({ ...filter, teacherId }),
        Cours.findOne({ ...filter, groupId }),
        Indisponibilite.findOne({ teacherId, dayOfWeek, slotIndex: index }),
      ]);

    if (salleConflict) {
      conflicts.push({
        type: "SALLE",
        message: `Salle déjà occupée à ce créneau${suffix}`,
      });
    }

    if (indisponibilite) {
      conflicts.push({
        type: "TEACHER_UNAVAILABLE",
        message: `Enseignant déclaré indisponible sur ce créneau${suffix}`,
      });
    }

    if (teacherConflict) {
      conflicts.push({
        type: "ENSEIGNANT",
        message: `Enseignant déjà occupé à ce créneau${suffix}`,
      });
    }

    if (groupConflict) {
      conflicts.push({
        type: "GROUPE",
        message: `Le groupe a déjà un cours à ce créneau${suffix}`,
      });
    }
  }

  return conflicts;
};
