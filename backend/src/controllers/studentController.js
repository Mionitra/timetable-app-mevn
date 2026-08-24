import {
  User,
  Cours,
  Subject,
  Enrollment,
} from "../Models/index.js";

// =====================================================
// HELPER : FORMATER UN COURS
// =====================================================

const formatCours = (c) => {
  return {
    id: c._id,

    dayOfWeek: c.day_of_week,

    startTime: c.start_time,

    endTime: c.end_time,

    type: c.type,

    description: c.description || "",

    room: c.salle_id
      ? c.salle_id.name
      : "Salle non définie",

    subject: c.subject_id
      ? {
          id: c.subject_id._id,
          name: c.subject_id.name,
          duree: c.subject_id.duree,
          credits: c.subject_id.credits,
          code: c.subject_id.code,
        }
      : null,

    salle: c.salle_id
      ? {
          id: c.salle_id._id,
          name: c.salle_id.name,
          capacite: c.salle_id.capacite,
        }
      : null,

    teacher: c.teacher_id
      ? {
          id: c.teacher_id._id,
          firstName: c.teacher_id.first_name,
          lastName: c.teacher_id.last_name,
        }
      : null,

    group: c.group_id
      ? {
          id: c.group_id._id,
          name: c.group_id.name,
          department: c.group_id.department,
          studyLevel: c.group_id.study_level,
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
      .select("-password_hash")
      .populate(
        "group_id",
        "name department study_level"
      );

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    return res.status(200).json({
      id: user._id,

      firstName: user.first_name,

      lastName: user.last_name,

      email: user.email,

      role: user.role,

      studentId: user.student_id,

      niveau: user.niveau,

      filiere: user.filiere,

      joinDate: user.join_date,

      group: user.group_id || null,

      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const updateData = {};

    if (firstName) {
      updateData.first_name = firstName.trim();
    }

    if (lastName) {
      updateData.last_name = lastName.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Aucune donnée à mettre à jour",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
        select: "-password_hash",
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    return res.status(200).json({
      message: "Profil mis à jour",

      user: {
        id: user._id,

        firstName: user.first_name,

        lastName: user.last_name,

        email: user.email,

        role: user.role,

        niveau: user.niveau,

        filiere: user.filiere,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

// =====================================================
// GET DASHBOARD
// =====================================================

export const getDashboard = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select("group_id filiere niveau");

    if (!student) {
      return res.status(404).json({
        message: "Étudiant introuvable",
      });
    }

    if (!student.group_id) {
      return res.status(200).json({
        todayClasses: [],
        nextClass: null,

        stats: {
          completedTasks: 0,
          totalSubjects: 0,
        },

        filiere: student.filiere || null,
        niveau: student.niveau || null,
      });
    }

    // ================================================
    // JOUR ACTUEL
    // ================================================

    const jsDay = new Date().getDay();

    const dayMap = {
      0: 7,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
    };

    const dayOfWeek = dayMap[jsDay];

    const currentTime = new Date()
      .toTimeString()
      .slice(0, 5);

    // ================================================
    // COURS DU JOUR
    // ================================================

    const todayCours = await Cours.find({
      group_id: student.group_id,
      day_of_week: dayOfWeek,
    })
      .populate("subject_id", "name duree credits code")
      .populate("salle_id", "name capacite")
      .populate(
        "teacher_id",
        "first_name last_name"
      )
      .populate(
        "group_id",
        "name department study_level"
      )
      .sort({
        start_time: 1,
      });

    const formatted = todayCours.map(formatCours);

    const nextClass =
      formatted.find(
        (course) =>
          course.startTime >= currentTime
      ) ||
      null;

    // ================================================
    // MATIERES
    // ================================================

    const distinctSubjects =
      await Cours.distinct(
        "subject_id",
        {
          group_id: student.group_id,
        }
      );

    return res.status(200).json({
      todayClasses: formatted,

      nextClass,

      stats: {
        completedTasks: 0,

        totalSubjects:
          distinctSubjects.length,
      },

      filiere: student.filiere,

      niveau: student.niveau,
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// =====================================================
// GET SCHEDULE
// EMPLOI DU TEMPS DE L'ÉTUDIANT CONNECTÉ
// =====================================================

export const getSchedule = async (req, res) => {
  try {
    // ================================================
    // 1. RÉCUPÉRER L'ÉTUDIANT CONNECTÉ
    // ================================================

    const student = await User.findById(req.user.id)
      .select(
        "first_name last_name email group_id filiere niveau"
      )
      .populate(
        "group_id",
        "name department study_level"
      );

    if (!student) {
      return res.status(404).json({
        success: false,

        message: "Étudiant introuvable",
      });
    }

    // ================================================
    // 2. VÉRIFIER LA FILIÈRE
    // ================================================

    if (!student.filiere) {
      return res.status(400).json({
        success: false,

        message:
          "Aucune filière n'est associée à votre compte.",
      });
    }

    // ================================================
    // 3. VÉRIFIER LE NIVEAU
    // ================================================

    if (!student.niveau) {
      return res.status(400).json({
        success: false,

        message:
          "Aucun niveau n'est associé à votre compte.",
      });
    }

    // ================================================
    // 4. VÉRIFIER LE GROUPE
    // ================================================

    if (!student.group_id) {
      return res.status(200).json({
        success: true,

        student: {
          id: student._id,

          firstName: student.first_name,

          lastName: student.last_name,

          filiere: student.filiere,

          niveau: student.niveau,
        },

        group: null,

        data: [],
      });
    }

    // ================================================
    // 5. RÉCUPÉRER LE GROUPE
    // ================================================

    const group = student.group_id;

    // ================================================
    // 6. RÉCUPÉRER LES COURS DU GROUPE
    // ================================================

    const courses = await Cours.find({
      group_id: group._id,
    })
      .populate(
        "subject_id",
        "name duree credits code"
      )
      .populate(
        "salle_id",
        "name capacite"
      )
      .populate(
        "teacher_id",
        "first_name last_name"
      )
      .populate(
        "group_id",
        "name department study_level"
      )
      .sort({
        day_of_week: 1,

        start_time: 1,
      });

    // ================================================
    // 7. FORMATAGE
    // ================================================

    const formattedCourses =
      courses.map(formatCours);

    // ================================================
    // 8. RÉPONSE
    // ================================================

    return res.status(200).json({
      success: true,

      student: {
        id: student._id,

        firstName: student.first_name,

        lastName: student.last_name,

        email: student.email,

        filiere: student.filiere,

        niveau: student.niveau,
      },

      group: {
        id: group._id,

        name: group.name,

        department: group.department,

        studyLevel: group.study_level,
      },

      data: formattedCourses,
    });
  } catch (error) {
    console.error(
      "Schedule Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Erreur lors du chargement de l'emploi du temps",

      error: error.message,
    });
  }
};

// =====================================================
// GET SUBJECTS
// =====================================================

export const getSubjects = async (req, res) => {
  try {
    const student = await User.findById(
      req.user.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Étudiant introuvable",
      });
    }

    const enrollments =
      await Enrollment.find({
        student_id: student._id,
      }).populate({
        path: "subject_id",

        populate: {
          path: "user_id",

          select:
            "first_name last_name",
        },
      });

    const formatted = enrollments
      .filter((e) => e.subject_id)
      .map((e) => {
        const subject = e.subject_id;

        return {
          id: subject._id,

          name: subject.name,

          duree: subject.duree,

          credits: subject.credits,

          code: subject.code,

          createdAt:
            subject.created_at,

          teacher: subject.user_id
            ? {
                id: subject.user_id._id,

                firstName:
                  subject.user_id.first_name,

                lastName:
                  subject.user_id.last_name,
              }
            : null,
        };
      });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(
      "Subjects Error:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur",

      error: error.message,
    });
  }
};