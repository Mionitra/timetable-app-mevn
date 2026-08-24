import Group from "../Models/Group.js";
import AcademicYear from "../Models/AcademicYear.js";

// =====================================================
// GET /api/admin/groupes
// Récupérer tous les groupes
// =====================================================

export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate("academic_year_id")
            .sort({
                study_level: 1,
                name: 1,
            });

        return res.status(200).json({
            success: true,
            data: groups,
        });

    } catch (error) {
        console.error("Erreur getGroups :", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors du chargement des groupes",
            error: error.message,
        });
    }
};


// =====================================================
// GET /api/admin/groupes/:id
// Récupérer un groupe
// =====================================================

export const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await Group.findById(id)
            .populate("academic_year_id");

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Groupe introuvable",
            });
        }

        return res.status(200).json({
            success: true,
            data: group,
        });

    } catch (error) {
        console.error("Erreur getGroupById :", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération du groupe",
            error: error.message,
        });
    }
};


// =====================================================
// POST /api/admin/groupes
// Créer un groupe
// =====================================================

export const createGroup = async (req, res) => {
    try {
        const {
            name,
            department,
            study_level,
            academic_year_id,
        } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Le nom du groupe est obligatoire",
            });
        }

        if (!academic_year_id) {
            return res.status(400).json({
                success: false,
                message: "L'année académique est obligatoire",
            });
        }

        // Vérifier l'année académique
        const academicYear = await AcademicYear.findById(
            academic_year_id
        );

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Année académique introuvable",
            });
        }

        // Vérifier doublon
        const existingGroup = await Group.findOne({
            name: name.trim(),
            academic_year_id,
        });

        if (existingGroup) {
            return res.status(409).json({
                success: false,
                message:
                    "Ce groupe existe déjà pour cette année académique",
            });
        }

        // Création
        const group = await Group.create({
            name: name.trim(),
            department: department?.trim() || "",
            study_level: study_level?.trim() || "",
            academic_year_id,
        });

        // Populate
        const populatedGroup = await Group.findById(group._id)
            .populate("academic_year_id");

        return res.status(201).json({
            success: true,
            message: "Groupe créé avec succès",
            data: populatedGroup,
        });

    } catch (error) {
        console.error("Erreur createGroup :", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la création du groupe",
            error: error.message,
        });
    }
};


// =====================================================
// PUT /api/admin/groupes/:id
// Modifier un groupe
// =====================================================

export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            department,
            study_level,
            academic_year_id,
        } = req.body;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Groupe introuvable",
            });
        }

        // Vérifier année académique
        if (academic_year_id) {
            const academicYear =
                await AcademicYear.findById(academic_year_id);

            if (!academicYear) {
                return res.status(404).json({
                    success: false,
                    message: "Année académique introuvable",
                });
            }
        }

        const newName =
            name?.trim() || group.name;

        const newAcademicYear =
            academic_year_id || group.academic_year_id;

        // Vérifier doublon
        const duplicate = await Group.findOne({
            _id: { $ne: id },
            name: newName,
            academic_year_id: newAcademicYear,
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message:
                    "Ce groupe existe déjà pour cette année académique",
            });
        }

        // Mise à jour
        group.name = newName;

        if (department !== undefined) {
            group.department = department.trim();
        }

        if (study_level !== undefined) {
            group.study_level = study_level.trim();
        }

        if (academic_year_id) {
            group.academic_year_id = academic_year_id;
        }

        await group.save();

        const updatedGroup =
            await Group.findById(id)
                .populate("academic_year_id");

        return res.status(200).json({
            success: true,
            message: "Groupe modifié avec succès",
            data: updatedGroup,
        });

    } catch (error) {
        console.error("Erreur updateGroup :", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la modification du groupe",
            error: error.message,
        });
    }
};


// =====================================================
// DELETE /api/admin/groupes/:id
// Supprimer un groupe
// =====================================================

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Groupe introuvable",
            });
        }

        await Group.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Groupe supprimé avec succès",
        });

    } catch (error) {
        console.error("Erreur deleteGroup :", error);

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression du groupe",
            error: error.message,
        });
    }
};