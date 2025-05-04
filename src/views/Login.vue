<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card login-card">
            <div class="card-body">
              <div class="text-center mb-4">
                <h1 class="app-title">DevGate</h1>
                <p class="app-subtitle">
                  Votre réseau social pour suivre votre progression technique
                </p>
              </div>

              <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
              </div>

              <div v-if="!isRegisterMode">
                <!-- Login Form -->
                <form @submit.prevent="handleSubmit">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="email"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label"
                      >Mot de passe</label
                    >
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="password"
                      required
                    />
                  </div>
                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="isPending"
                    >
                      <span
                        v-if="isPending"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Se connecter
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-primary"
                      @click="handleGoogleLogin"
                      :disabled="isGooglePending"
                    >
                      <span
                        v-if="isGooglePending"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      <font-awesome-icon
                        :icon="['fab', 'google']"
                        class="me-2"
                      />
                      Se connecter avec Google
                    </button>
                  </div>
                </form>
                <div class="text-center mt-3">
                  <p>
                    Pas encore de compte ?
                    <a href="#" @click.prevent="isRegisterMode = true"
                      >S'inscrire</a
                    >
                  </p>
                </div>
              </div>

              <div v-else>
                <!-- Register Form -->
                <form @submit.prevent="handleRegister">
                  <div class="mb-3">
                    <label for="displayName" class="form-label"
                      >Nom complet</label
                    >
                    <input
                      type="text"
                      class="form-control"
                      id="displayName"
                      v-model="displayName"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="registerEmail" class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      id="registerEmail"
                      v-model="email"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="registerPassword" class="form-label"
                      >Mot de passe</label
                    >
                    <input
                      type="password"
                      class="form-control"
                      id="registerPassword"
                      v-model="password"
                      required
                    />
                  </div>
                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="isPending"
                    >
                      <span
                        v-if="isPending"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      S'inscrire
                    </button>
                  </div>
                </form>
                <div class="text-center mt-3">
                  <p>
                    Déjà un compte ?
                    <a href="#" @click.prevent="isRegisterMode = false"
                      >Se connecter</a
                    >
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const { login, loginWithGoogle, register, error, isPending } = useAuth();

    const email = ref("");
    const password = ref("");
    const displayName = ref("");
    const isRegisterMode = ref(false);
    const isGooglePending = ref(false);
    const localError = ref(null);

    const handleSubmit = async () => {
      if (!email.value || !password.value) return;

      try {
        const user = await login(email.value, password.value);
        if (user) {
          router.push("/dashboard");
        }
      } catch (err) {
        localError.value = err.message;
      }
    };

    const handleGoogleLogin = async () => {
      isGooglePending.value = true;

      try {
        const user = await loginWithGoogle();
        // Only redirect if we actually got a user back
        if (user) {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Google login failed:", err);
        localError.value = "La connexion avec Google a échoué";
      } finally {
        // Always reset the loading state, even if the popup was closed
        isGooglePending.value = false;
      }
    };

    const handleRegister = async () => {
      if (!email.value || !password.value || !displayName.value) return;

      try {
        const user = await register(
          email.value,
          password.value,
          displayName.value
        );
        if (user) {
          isRegisterMode.value = false;
          router.push("/dashboard");
        }
      } catch (err) {
        localError.value = err.message;
      }
    };

    return {
      email,
      password,
      displayName,
      error,
      localError,
      isPending,
      isGooglePending,
      isRegisterMode,
      handleSubmit,
      handleGoogleLogin,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  padding: 2rem 0;
}

.login-card {
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: none;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.app-subtitle {
  color: var(--gray-color);
  font-size: 1rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border-radius: 8px;
}

.btn {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}
</style>
