import Course from "../Models/Course.js";
import Subject from "../Models/Subject.js";
import Enrollment from "../Models/Enrollment.js";
import User from "../Models/User.js";

// =====================================================
// GET PROFILE
// =====================================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, address, profileImage, coverImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, bio, address, profileImage, coverImage },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json({ message: "Profil mis à jour", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// HELPER: Get Subjects
// =====================================================
const getStudentSubjectIds = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId });
  return enrollments.map((e) => e.subject);
};

// =====================================================
// GET DASHBOARD OVERVIEW
// =====================================================
export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const subjectIds = await getStudentSubjectIds(studentId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's classes
    const todayClasses = await Course.find({
      subject: { $in: subjectIds },
      courseDate: { $gte: today, $lt: tomorrow },
    })
      .populate("subject", "name code color")
      .populate("teacher", "firstName lastName")
      .sort({ startTime: 1 });

    // Next class (first upcoming class today)
    const nowTimeStr = new Date().toTimeString().slice(0, 5); // "HH:MM"
    const nextClass =
      todayClasses.find((c) => c.startTime >= nowTimeStr) ||
      todayClasses[0] ||
      null;

    res.status(200).json({
      todayClasses,
      nextClass,
      stats: {
        completedTasks: 13,
        totalSubjects: subjectIds.length,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// =====================================================
// GET SCHEDULE (COURSES)
// =====================================================
export const getSchedule = async (req, res) => {
  try {
    const studentId = req.user.id;
    const subjectIds = await getStudentSubjectIds(studentId);

    // Get all courses for these subjects (ideally you'd filter by week)
    const courses = await Course.find({
      subject: { $in: subjectIds },
    })
      .populate("subject", "name code color")
      .populate("teacher", "firstName lastName");

    res.status(200).json(courses);
  } catch (error) {
    console.error("Schedule Error:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// =====================================================
// GET SUBJECTS
// =====================================================
export const getSubjects = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ student: studentId }).populate({
      path: "subject",
      populate: {
        path: "teacher",
        select: "firstName lastName",
      },
    });

    const subjects = enrollments.map((e) => e.subject).filter(Boolean);

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Subjects Error:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
