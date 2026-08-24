import User from "../Models/User.js";
import Cours from "../Models/Cours.js";
import { SLOTS, getISOWeek } from "../config/slots.js";

// =====================================================
// HELPER : formater un cours publié pour l'espace étudiant.
// Les horaires affichés sont dérivés du référentiel fixe
// de créneaux (aucune donnée temporelle libre en base).
// =====================================================
const formatCours = (c) => {
  const slot = SLOTS.find((s) => s.index === c.slotIndex);

  return {
    id: c._id,
    dayOfWeek: c.dayOfWeek,
    slotIndex: c.slotIndex,
    startTime: slot ? slot.startTime : null,
    endTime: slot ? slot.endTime : null,
    type: c.type,
    room: c.salleId ? c.salleId.name : "Non définie",
    subject: c.subjectId
      ? { id: c.subjectId._id, name: c.subjectId.name, semester: c.subjectId.semester }
      : null,
    salle: c.salleId
      ? { id: c.salleId._id, name: c.salleId.name }
      : null,
    teacher: c.teacherId
      ? {
          id: c.teacherId._id,
          firstName: c.teacherId.firstName,
          lastName: c.teacherId.lastName,
        }
      : null,
  };
};

// =====================================================
// GET PROFILE
// =====================================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("groupId", "name promotion");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      joinDate: user.joinDate,
      niveau: user.niveau,
      filiere: user.filiere,
      group: user.groupId || null,
      createdAt: user.createdAt,
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
    const {
      firstName,
      lastName,
      phone,
      bio,
      address,
      profileImage,
      coverImage,
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (address !== undefined) updateData.address = address;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.status(200).json({
      message: "Profil mis à jour",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
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
// GET DASHBOARD
// Aperçu du jour : cours PUBLIÉS du groupe de l'étudiant
// (groupe dérivé du token, RF-STUD-02)
// =====================================================
export const getDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("groupId");

    if (!student || !student.groupId) {
      return res.status(200).json({
        todayClasses: [],
        nextClass: null,
        stats: { totalSubjects: 0 },
      });
    }

    // Jour courant ISO (1=lundi … 7=dimanche)
    const jsDay = new Date().getDay(); // 0=dim, 1=lun ... 6=sam
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    const { weekNumber, year } = getISOWeek(new Date());

    // Seuls les cours publiés sont visibles (section 2.1 RBAC)
    const todayCours = await Cours.find({
      groupId: student.groupId,
      isPublished: true,
      weekNumber,
      year,
      dayOfWeek,
    })
      .populate("subjectId", "name semester")
      .populate("salleId", "name")
      .populate("teacherId", "firstName lastName")
      .sort({ slotIndex: 1 });

    const formatted = todayCours.map(formatCours);

    // Prochain cours = premier cours dont l'heure de début est à venir
    const currentTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
    const nextClass =
      formatted.find((c) => c.startTime && c.startTime >= currentTime) ||
      formatted[0] ||
      null;

    // Nombre de matières distinctes publiées cette semaine
    const distinctSubjects = await Cours.distinct("subjectId", {
      groupId: student.groupId,
      isPublished: true,
      weekNumber,
      year,
    });

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
