<template>
  <header class="app-header">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <button class="btn btn-icon me-3 d-lg-none" @click="toggleSidebar">
            <font-awesome-icon icon="bars" />
          </button>
          <div class="app-logo d-none d-lg-block">
            <router-link to="/dashboard" class="text-decoration-none">
              <span class="logo-text">DevGate</span>
            </router-link>
          </div>
        </div>
        <div class="d-flex align-items-center">
          <div class="dropdown">
            <button
              class="btn btn-profile"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div
                v-if="userProfile && userProfile.photoURL"
                class="avatar-container"
              >
                <img :src="userProfile.photoURL" alt="Profile" class="avatar" />
              </div>
              <div v-else class="avatar-placeholder">
                {{ userInitials }}
              </div>
              <span class="ms-2 d-none d-md-inline">{{
                userProfile ? userProfile.displayName : "Utilisateur"
              }}</span>
              
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="profileDropdown"
            >
              <li>
                <h6 class="dropdown-header">
                  {{ userProfile ? userProfile.displayName : "Utilisateur" }}
                </h6>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <router-link to="/dashboard" class="dropdown-item">
                  <font-awesome-icon icon="gauge" class="me-2" />
                  Tableau de bord
                </router-link>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                  <font-awesome-icon icon="sign-out-alt" class="me-2" />
                  Déconnexion
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";
import { useUser } from "../../composables/useUser";

export default {
  name: "AppHeader",
  setup() {
    const router = useRouter();
    const { logout } = useAuth();
    const { userProfile, getUserProfile } = useUser();
    const sidebarOpen = ref(false);

    const userInitials = computed(() => {
      if (!userProfile.value || !userProfile.value.displayName) return "?";

      const names = userProfile.value.displayName.split(" ");
      if (names.length === 1) return names[0].charAt(0).toUpperCase();

      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    });

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
      document.body.classList.toggle("sidebar-open", sidebarOpen.value);
    };

    const handleLogout = async () => {
      await logout();
      router.push("/login");
    };

    onMounted(async () => {
      await getUserProfile();
    });

    return {
      userProfile,
      userInitials,
      toggleSidebar,
      handleLogout,
    };
  },
};
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.app-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: var(--dark-color);
  transition: background-color 0.3s;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-profile {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.btn-profile:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.avatar-container {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
</style>
