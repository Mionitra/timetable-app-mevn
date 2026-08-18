import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/Models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté avec succès pour le seed");

    // L'email de l'admin à créer
    const adminEmail = "admin@gmail.com";
    const adminPassword = "12345678";

    // Vérifier si cet admin existe déjà
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`⚠️ Un compte admin avec l'email ${adminEmail} existe déjà !`);
      process.exit(0);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Créer le compte admin
    const adminUser = new User({
      firstName: "Admin",
      lastName: "Principal",
      email: adminEmail,
      password: hashedPassword,
      role: "admin", // Rôle spécifique pour l'admin
      isActive: true,
    });

    await adminUser.save();
    console.log("Compte administrateur créé avec succès !");
    console.log("-----------------------------------------");
    console.log(`Email : ${adminEmail}`);
    console.log(`Mot de passe : ${adminPassword}`);
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la création de l'admin:", error);
    process.exit(1);
  }
};

seedAdmin();
