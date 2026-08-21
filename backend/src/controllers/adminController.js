import Salle from "../Models/Salle.js";
import AcademicYear from "../Models/AcademicYear.js";
import Semester from "../Models/Semester.js";
import Subject from "../Models/Subject.js";
import Cours from "../Models/Cours.js";

/* ================================================================
   SALLES
================================================================ */

export const getSalles = async (req, res) => {
  try {
    const salles = await Salle.find().sort({ name: 1 });
    res.json({ success: true, data: salles });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createSalle = async (req, res) => {
  try {
    const salle = await Salle.create(req.body);
    res.status(201).json({ success: true, data: salle });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const updateSalle = async (req, res) => {
  try {
    const salle = await Salle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!salle) return res.status(404).json({ success: false, message: "Salle introuvable" });
    res.json({ success: true, data: salle });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const deleteSalle = async (req, res) => {
  try {
    const salle = await Salle.findByIdAndDelete(req.params.id);
    if (!salle) return res.status(404).json({ success: false, message: "Salle introuvable" });
    res.json({ success: true, message: "Salle supprimée" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* ================================================================
   ACADEMIC YEARS
================================================================ */

export const getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ start_date: -1 });
    res.json({ success: true, data: years });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createAcademicYear = async (req, res) => {
  try {
    // Si is_current est true, désactiver les autres
    if (req.body.is_current) {
      await AcademicYear.updateMany({}, { is_current: false });
    }
    const year = await AcademicYear.create(req.body);
    res.status(201).json({ success: true, data: year });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const updateAcademicYear = async (req, res) => {
  try {
    if (req.body.is_current) {
      await AcademicYear.updateMany({ _id: { $ne: req.params.id } }, { is_current: false });
    }
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!year) return res.status(404).json({ success: false, message: "Année introuvable" });
    res.json({ success: true, data: year });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const deleteAcademicYear = async (req, res) => {
  try {
    const year = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!year) return res.status(404).json({ success: false, message: "Année introuvable" });
    res.json({ success: true, message: "Année académique supprimée" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* ================================================================
   SEMESTRES
================================================================ */

export const getSemestres = async (req, res) => {
  try {
    const semestres = await Semester.find().populate("academic_year_id", "name").sort({ start_date: 1 });
    res.json({ success: true, data: semestres });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createSemestre = async (req, res) => {
  try {
    const semestre = await Semester.create(req.body);
    res.status(201).json({ success: true, data: semestre });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const updateSemestre = async (req, res) => {
  try {
    const semestre = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!semestre) return res.status(404).json({ success: false, message: "Semestre introuvable" });
    res.json({ success: true, data: semestre });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const deleteSemestre = async (req, res) => {
  try {
    const semestre = await Semester.findByIdAndDelete(req.params.id);
    if (!semestre) return res.status(404).json({ success: false, message: "Semestre introuvable" });
    res.json({ success: true, message: "Semestre supprimé" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* ================================================================
   MATIÈRES (Subjects)
================================================================ */

export const getMatieres = async (req, res) => {
  try {
    // user_id requis par le schéma — on utilise un admin fictif si absent
    const matieres = await Subject.find().populate("semester_id", "name").sort({ name: 1 });
    res.json({ success: true, data: matieres });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createMatiere = async (req, res) => {
  try {
    // user_id = l'admin connecté
    const payload = { ...req.body, user_id: req.user.id };
    const matiere = await Subject.create(payload);
    res.status(201).json({ success: true, data: matiere });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const updateMatiere = async (req, res) => {
  try {
    const matiere = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!matiere) return res.status(404).json({ success: false, message: "Matière introuvable" });
    res.json({ success: true, data: matiere });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const deleteMatiere = async (req, res) => {
  try {
    const matiere = await Subject.findByIdAndDelete(req.params.id);
    if (!matiere) return res.status(404).json({ success: false, message: "Matière introuvable" });
    res.json({ success: true, message: "Matière supprimée" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

/* ================================================================
   COURS
================================================================ */

export const getCours = async (req, res) => {
  try {
    const cours = await Cours.find()
      .populate("subject_id", "name code color")
      .populate("salle_id", "name batiment")
      .populate("teacher_id", "first_name last_name")
      .sort({ day_of_week: 1, start_time: 1 });
    res.json({ success: true, data: cours });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createCours = async (req, res) => {
  try {
    const cours = await Cours.create(req.body);
    res.status(201).json({ success: true, data: cours });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const updateCours = async (req, res) => {
  try {
    const cours = await Cours.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cours) return res.status(404).json({ success: false, message: "Cours introuvable" });
    res.json({ success: true, data: cours });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

export const deleteCours = async (req, res) => {
  try {
    const cours = await Cours.findByIdAndDelete(req.params.id);
    if (!cours) return res.status(404).json({ success: false, message: "Cours introuvable" });
    res.json({ success: true, message: "Cours supprimé" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
