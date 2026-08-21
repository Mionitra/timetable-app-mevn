import {
  User,
  Cours,
  Subject,
  Enrollment,
}
  from "../Models/index.js";

// =====================================================
// GET PROFILE
// =====================================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password_hash")
      .populate("group_id", "name department study_level");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.status(200).json({
      id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      studentId: user.student_id,
      joinDate: user.join_date,
      group: user.group_id || null,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const updateData = {};
    if (firstName) updateData.first_name = firstName.trim();
    if (lastName) updateData.last_name = lastName.trim();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true, select: "-password_hash" }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.status(200).json({
      message: "Profil mis à jour",
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// HELPER : formater un cours Mongoose en objet propre
// =====================================================
const formatCours = (c) => {
  return {
    id: c._id,
    dayOfWeek: c.day_of_week,
    startTime: c.start_time,
    endTime: c.end_time,
    type: c.type,
    description: c.description,
    room: c.salle_id ? c.salle_id.name : "Non définie",
    subject: c.subject_id
      ? { id: c.subject_id._id, name: c.subject_id.name, duree: c.subject_id.duree }
      : null,
    salle: c.salle_id
      ? { id: c.salle_id._id, name: c.salle_id.name, capacite: c.salle_id.capacite }
      : null,
    teacher: c.teacher_id
      ? { id: c.teacher_id._id, firstName: c.teacher_id.first_name, lastName: c.teacher_id.last_name }
      : null,
  };
};

// =====================================================
// GET DASHBOARD
// =====================================================
export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Récupérer le groupe de l'étudiant
    const student = await User.findById(studentId).select("group_id");

    if (!student || !student.group_id) {
      return res.status(200).json({
        todayClasses: [],
        nextClass: null,
        stats: { totalSubjects: 0 },
      });
    }

    // Jour de la semaine actuel (1=lundi … 7=dimanche)
    const jsDay = new Date().getDay(); // 0=dim, 1=lun ... 6=sam
    const dayMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    const dayOfWeek = dayMap[jsDay];

    const currentTime = new Date().toTimeString().slice(0, 5); // "HH:MM"

    // Cours d'aujourd'hui pour ce groupe
    const todayCours = await Cours.find({
      group_id: student.group_id,
      day_of_week: dayOfWeek,
    })
      .populate("subject_id", "name duree")
      .populate("salle_id", "name capacite")
      .populate("teacher_id", "first_name last_name")
      .sort({ start_time: 1 });

    const formatted = todayCours.map(formatCours);
    const nextClass = formatted.find((c) => c.startTime >= currentTime) || formatted[0] || null;

    // Nombre de matières distinctes du groupe
    const distinctSubjects = await Cours.distinct("subject_id", { group_id: student.group_id });

    return res.status(200).json({
      todayClasses: formatted,
      nextClass,
      stats: { totalSubjects: distinctSubjects.length },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// =====================================================
// GET SCHEDULE (EMPLOI DU TEMPS COMPLET)
// =====================================================
export const getSchedule = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("group_id");

    if (!student || !student.group_id) {
      return res.status(200).json([]);
    }

    const courses = await Cours.find({ group_id: student.group_id })
      .populate("subject_id", "name duree")
      .populate("salle_id", "name capacite")
      .populate("teacher_id", "first_name last_name")
      .sort({ day_of_week: 1, start_time: 1 });

    return res.status(200).json(courses.map(formatCours));
  } catch (error) {
    console.error("Schedule Error:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// =====================================================
// GET SUBJECTS (MATIÈRES INSCRITES)
// =====================================================
export const getSubjects = async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    if (!student) {
      return res.status(200).json([]);
    }

    // Récupérer les inscriptions de l'étudiant
    const enrollments = await Enrollment.find({ student_id: student._id })
      .populate({
        path: "subject_id",
        populate: { path: "user_id", select: "first_name last_name" }
      });

    const formatted = enrollments.map((e) => {
      const s = e.subject_id;
      return {
        id: s._id,
        name: s.name,
        duree: s.duree,
        credits: s.credits,
        code: s.code,
        createdAt: s.created_at,
        teacher: s.user_id
          ? { id: s.user_id._id, firstName: s.user_id.first_name, lastName: s.user_id.last_name }
          : null,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Subjects Error:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
