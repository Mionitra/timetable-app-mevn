// =========================================================
// Utilitaires semaines ISO-8601 : partagés par les vues
// admin / enseignant / étudiant pour le sélecteur de semaine.
// =========================================================

/**
 * Retourne { weekNumber, year } ISO-8601 pour une date donnée.
 */
export const getISOWeek = (date = new Date()) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { weekNumber, year: d.getUTCFullYear() };
};

export const getCurrentWeek = () => getISOWeek(new Date());

/**
 * Liste de semaines autour de la semaine courante
 * (par défaut : 2 précédentes → 6 suivantes).
 * Format : { weekNumber, year, label }
 */
export const getWeekOptions = (before = 2, after = 6) => {
  const options = [];
  const current = getCurrentWeek();

  // Position dans l'année via une date du lundi de la semaine courante
  const mondayOfISOWeek = (weekNumber, year) => {
    const simple = new Date(Date.UTC(year, 0, 1 + (weekNumber - 1) * 7));
    const dayNum = simple.getUTCDay() || 7;
    simple.setUTCDate(simple.getUTCDate() + 1 - dayNum);
    return simple;
  };

  for (let offset = -before; offset <= after; offset++) {
    const monday = mondayOfISOWeek(current.weekNumber, current.year);
    monday.setUTCDate(monday.getUTCDate() + offset * 7);

    const iso = getISOWeek(new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()));

    options.push({
      weekNumber: iso.weekNumber,
      year: iso.year,
      label: `S${iso.weekNumber} · ${iso.year}`,
      isCurrent:
        iso.weekNumber === current.weekNumber && iso.year === current.year,
    });
  }

  return options;
};
