<script setup>
import { ref, computed, onMounted } from "vue";
import { useEtudiantStore } from "../../stores/etudiant";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const etudiantStore = useEtudiantStore();
const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await etudiantStore.fetchProfile();
  
  // Si le fetch échoue (ex: 401 ou 404 car l'ancien compte est supprimé par le seed)
  // On déconnecte l'utilisateur pour le forcer à se reconnecter
  if (etudiantStore.error) {
    authStore.logout();
    router.push("/connexion");
  }
});

const profile = computed(() => etudiantStore.profile || {});

// Edit mode
const isEditing = ref(false);
const saveSuccess = ref(false);
const form = ref({ 
  firstName: "", 
  lastName: "", 
  phone: "", 
  bio: "", 
  address: "",
  profileImage: "",
  coverImage: "" 
});

const startEdit = () => {
  form.value = {
    firstName: profile.value.firstName || "",
    lastName: profile.value.lastName || "",
    phone: profile.value.phone || "",
    bio: profile.value.bio || "",
    address: profile.value.address || "",
    profileImage: profile.value.profileImage || "",
    coverImage: profile.value.coverImage || "",
  };
  isEditing.value = true;
  saveSuccess.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const handleImageUpload = (event, type) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (type === 'profile') {
      form.value.profileImage = e.target.result;
    } else if (type === 'cover') {
      form.value.coverImage = e.target.result;
    }
  };
  reader.readAsDataURL(file);
};

const saveProfile = async () => {
  const result = await etudiantStore.updateProfile(form.value);
  if (result.success) {
    isEditing.value = false;
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 3000);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Non défini";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const niveauLabel = { L1: "Licence 1", L2: "Licence 2", L3: "Licence 3" };
const filiereLabel = {
  IAD: "Intelligence Artificielle & Data",
  ARSB: "Architecture Réseaux & Sécurité",
  GL: "Génie Logiciel",
  SIG: "Systèmes d'Information & Gestion",
  "R&T": "Réseaux & Télécommunications",
};
</script>

<template>
  <div class="max-w-4xl pb-12 mx-auto space-y-8">

    <!-- Loading -->
    <div v-if="etudiantStore.loading && !profile.email" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-blue-500/30 border-t-blue-500 animate-spin"></div>
        <p class="text-gray-400">Chargement du profil...</p>
      </div>
    </div>

    <template v-else>
      <!-- Success Banner -->
      <div v-if="saveSuccess" class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-green-400 border rounded-xl bg-white/5 border-green-500/30">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        Profil mis à jour avec succès !
      </div>

      <!-- Error Banner -->
      <div v-if="etudiantStore.error" class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-400 border rounded-xl bg-red-500/10 border-red-500/30">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        {{ etudiantStore.error }}
      </div>

      <!-- Profile Header -->
      <div class="bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
        <!-- Cover Photo -->
        <div class="relative h-36 bg-white/5">
          <img v-if="isEditing ? form.coverImage : profile.coverImage" 
               :src="isEditing ? form.coverImage : profile.coverImage" 
               class="absolute inset-0 object-cover w-full h-full" />
          <div v-if="!isEditing && !profile.coverImage" class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></div>
          <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gt-card/50 to-transparent"></div>
          
          <!-- Edit cover button -->
          <label v-if="isEditing" class="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Modifier la couverture
            <input type="file" class="hidden" accept="image/*" @change="e => handleImageUpload(e, 'cover')" />
          </label>
        </div>

        <div class="relative px-8 pb-8">
          <div class="flex flex-col items-start gap-6 mb-6 -mt-16 sm:flex-row sm:items-end">
            <!-- Avatar -->
            <div class="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600/5 to-indigo-700 border-4 border-gt-card shadow-2xl flex items-center justify-center text-4xl font-bold text-white shrink-0 relative overflow-hidden group">
              <img v-if="isEditing ? form.profileImage : profile.profileImage" 
                   :src="isEditing ? form.profileImage : profile.profileImage" 
                   class="object-cover w-full h-full" />
              <span v-else>{{ profile.firstName?.charAt(0) || 'E' }}{{ profile.lastName?.charAt(0) || '' }}</span>
              
              <!-- Edit profile pic button overlay -->
              <label v-if="isEditing" class="absolute inset-0 flex flex-col items-center justify-center transition-opacity opacity-0 cursor-pointer bg-black/60 group-hover:opacity-100">
                 <svg class="w-8 h-8 mb-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 <span class="text-[10px] font-medium text-white">Changer photo</span>
                 <input type="file" class="hidden" accept="image/*" @change="e => handleImageUpload(e, 'profile')" />
              </label>

              <div v-if="!isEditing" class="absolute w-5 h-5 bg-green-500 border-2 rounded-full bottom-1 right-1 border-gt-card"></div>
            </div>

            <div class="flex-1 pb-2">
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h1 class="text-3xl font-bold text-white">{{ profile.firstName }} {{ profile.lastName }}</h1>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Étudiant</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Actif</span>
              </div>
              <p class="flex items-center gap-2 mb-1 text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {{ profile.email }}
              </p>
              <p v-if="profile.filiere" class="flex items-center gap-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7"></path></svg>
                {{ niveauLabel[profile.niveau] || profile.niveau }} — {{ filiereLabel[profile.filiere] || profile.filiere }}
              </p>
            </div>

            <div class="flex gap-3 pb-2">
              <button v-if="!isEditing" @click="startEdit" class="px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Modifier
              </button>
              <template v-else>
                <button @click="cancelEdit" class="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-colors">
                  Annuler
                </button>
                <button @click="saveProfile" :disabled="etudiantStore.loading" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
                  <svg v-if="etudiantStore.loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  Enregistrer
                </button>
              </template>
            </div>
          </div>

          <!-- Bio -->
          <div v-if="profile.bio || isEditing" class="pt-4 mt-2 border-t border-white/5">
            <p v-if="!isEditing" class="text-sm leading-relaxed text-gray-400">{{ profile.bio || 'Aucune biographie.' }}</p>
            <textarea v-else v-model="form.bio" rows="2" placeholder="Votre biographie..."
              class="w-full p-3 text-sm text-white placeholder-gray-500 transition-colors border outline-none resize-none bg-gray-900/60 border-white/10 rounded-xl focus:border-blue-500/50">
            </textarea>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">

        <!-- Left: Info cards -->
        <div class="space-y-6 md:col-span-2">

          <!-- Personal Info -->
          <div class="bg-white/5 border border-white/5 rounded-[2rem] p-6 shadow-lg">
            <h3 class="flex items-center gap-2 pb-3 mb-5 text-base font-bold text-white border-b border-white/5">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Informations Personnelles
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Prénom -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Prénom</label>
                <input v-if="isEditing" v-model="form.firstName" class="w-full bg-gray-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors" />
                <p v-else class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ profile.firstName || '—' }}</p>
              </div>
              <!-- Nom -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Nom</label>
                <input v-if="isEditing" v-model="form.lastName" class="w-full bg-gray-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors" />
                <p v-else class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ profile.lastName || '—' }}</p>
              </div>
              <!-- Email -->
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Email</label>
                <p class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {{ profile.email || '—' }}
                  <span class="ml-auto text-xs text-gray-600">(non modifiable)</span>
                </p>
              </div>
              <!-- Phone -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Téléphone</label>
                <input v-if="isEditing" v-model="form.phone" placeholder="+261 34 00 000 00" class="w-full bg-gray-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors" />
                <p v-else class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ profile.phone || 'Non renseigné' }}</p>
              </div>
              <!-- Address -->
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Adresse</label>
                <input v-if="isEditing" v-model="form.address" placeholder="Antananarivo, Madagascar" class="w-full bg-gray-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-colors" />
                <p v-else class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ profile.address || 'Non renseignée' }}</p>
              </div>
            </div>
          </div>

          <!-- Cursus -->
          <div class="bg-white/5 border border-white/5 rounded-[2rem] p-6 shadow-lg">
            <h3 class="flex items-center gap-2 pb-3 mb-5 text-base font-bold text-white border-b border-white/5">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7"></path></svg>
              Cursus Universitaire
            </h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Filière</label>
                <p class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ filiereLabel[profile.filiere] || profile.filiere || 'Non défini' }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Niveau</label>
                <p class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ niveauLabel[profile.niveau] || profile.niveau || 'Non défini' }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">Date d'inscription</label>
                <p class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800">{{ formatDate(profile.joinDate || profile.createdAt) }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium tracking-wider text-gray-500 uppercase">N° Étudiant</label>
                <p class="text-white font-medium bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-800 font-mono text-sm">{{ profile.studentId || 'Non assigné' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Widgets -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="relative p-6 overflow-hidden text-center shadow-lg bg-gradient-to-br from-indigo-600/5 to-purple-800/50 rounded-2xl">
            <div class="absolute w-24 h-24 rounded-full -right-6 -top-6 bg-white/10 blur-2xl"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 bg-white/20">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
              </div>
              <p class="mb-1 text-xs font-semibold tracking-wider text-indigo-200 uppercase">Statut du compte</p>
              <p class="text-2xl font-bold text-white">{{ profile.isActive ? 'Actif' : 'Inactif' }}</p>
              <p class="mt-2 text-xs text-indigo-200">Inscrit depuis {{ formatDate(profile.joinDate || profile.createdAt) }}</p>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="p-5 border bg-white/5 border-white/5 rounded-2xl">
            <h3 class="mb-4 text-sm font-bold tracking-wider text-white uppercase">Informations rapides</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-white/5">
                <span class="text-xs text-gray-500">Rôle</span>
                <span class="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Étudiant</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-white/5">
                <span class="text-xs text-gray-500">Filière</span>
                <span class="text-xs font-medium text-gray-200">{{ profile.filiere || '—' }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-xs text-gray-500">Niveau</span>
                <span class="text-xs font-medium text-gray-200">{{ profile.niveau || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="p-5 border bg-white/5 border-white/5 rounded-2xl">
            <h3 class="mb-4 text-sm font-bold tracking-wider text-center text-white uppercase">Sécurité</h3>
            <RouterLink to="/etudiant/settings" class="block w-full py-2.5 text-center bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors mb-3 border border-white/5">
              Changer le mot de passe
            </RouterLink>
            <RouterLink to="/etudiant/settings" class="block w-full py-2.5 text-center bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/5">
              Paramètres du compte
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>