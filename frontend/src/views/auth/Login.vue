<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    const data = await authStore.login(
      email.value,
      password.value
    );

    const role = data.user.role;

    switch (role) {
      case "admin":
        router.push("/admin");
        break;

      case "enseignant":
        router.push("/enseignant");
        break;

      case "etudiant":
        router.push("/etudiant");
        break;

      default:
        router.push("/connexion");
    }
  } catch (error) {
    console.error(error);
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="w-full max-w-md p-8 border border-gray-200 shadow-2xl bg-white/5 rounded-xl backdrop-blur-md">

      <h1 class="mb-2 text-3xl font-bold text-center text-secondary">Connexion</h1>

      <p class="mb-8 text-center text-white">
        Connectez-vous à votre compte
      </p>

      <form @submit.prevent="handleLogin" class="space-y-5">

        <div>
          <label class="block mb-2 font-semibold text-secondary">Email</label>

          <input v-model="email" type="email" placeholder="exemple@gmail.com"
            class="w-full p-3 text-white placeholder-gray-400 transition-all border border-gray-300 rounded-lg bg-gray-50/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required />
        </div>

        <div>
          <label class="block mb-2 font-semibold text-secondary">Mot de passe</label>

          <input v-model="password" type="password" placeholder="********"
            class="w-full p-3 text-white placeholder-gray-400 transition-all border border-gray-300 rounded-lg bg-gray-50/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required />
        </div>

        <p v-if="authStore.error" class="text-sm font-medium text-red-400">
          {{ authStore.error }}
        </p>

        <button type="submit" :disabled="authStore.loading"
          class="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
          {{
            authStore.loading
              ? "Connexion..."
              : "Se connecter"
          }}
        </button>

      </form>

      <p class="mt-6 text-center text-white">
        Vous n'avez pas de compte ?

        <RouterLink to="/inscription" class="ml-1 font-medium text-primary hover:opacity-80">
          Créer un compte
        </RouterLink>
      </p>

    </div>
  </div>
</template>