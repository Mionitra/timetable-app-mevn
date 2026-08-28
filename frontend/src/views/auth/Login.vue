<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");

// Section 2.1 / RF-AUTH-02 : distinction du refus lié à un
// compte étudiant pas encore activé par l'administration.
const pendingActivation = ref(false);

const handleLogin = async () => {
  pendingActivation.value = false;

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
    if (error?.response?.data?.error === "ACCOUNT_PENDING_ACTIVATION") {
      pendingActivation.value = true;
    }

    console.error(error);
  }
};
</script>

<template>
  <div class="min-h-screen flex justify-center items-center bg-background">
    <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">

      <h1 class="text-3xl font-bold text-center text-secondary mb-2">Connexion</h1>

      <p class="text-center text-gray-500 mb-8">
        Connectez-vous à votre compte
      </p>

      <form @submit.prevent="handleLogin" class="space-y-5">

        <div>
          <label class="block mb-2 font-semibold text-secondary">Email</label>

          <input
            v-model="email"
            type="email"
            placeholder="exemple@gmail.com"
            class="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label class="block mb-2 font-semibold text-secondary">Mot de passe</label>

          <input
            v-model="password"
            type="password"
            placeholder="********"
            class="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-secondary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        <div
          v-if="pendingActivation"
          class="p-3 border rounded-lg bg-amber-500/10 border-amber-500/30"
        >
          <p class="text-sm font-medium text-amber-500">
            ⏳ Votre compte est en attente d'activation par l'administration.
            Vous serez informé une fois votre compte activé.
          </p>
        </div>

        <p
          v-else-if="authStore.error"
          class="text-red-400 text-sm font-medium"
        >
          {{ authStore.error }}
        </p>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-3 bg-primary hover:opacity-90 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {{
            authStore.loading
              ? "Connexion..."
              : "Se connecter"
          }}
        </button>

      </form>

      <p class="mt-6 text-center text-gray-500">
        Vous n'avez pas de compte ?

        <RouterLink to="/inscription" class="text-primary hover:opacity-80 font-medium ml-1">
          Créer un compte
        </RouterLink>
      </p>

    </div>
  </div>
</template>