<template>
  <div class="sidebar-wrapper">
    <!-- Mobile sidebar toggle button -->
    <button
      class="sidebar-toggle-btn"
      @click="toggleSidebar"
      aria-label="Toggle sidebar"
    >
      <font-awesome-icon :icon="isOpen ? 'times' : 'bars'" />
    </button>

    <!-- Overlay for mobile -->
    <div
      class="sidebar-overlay"
      :class="{ active: isOpen }"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ open: isOpen, collapsed: isCollapsed && !isOpen }"
    >
      <!-- Logo and collapse button -->
      <div class="sidebar-header">
        <div class="logo-container">
          <h2 class="logo">DevGate</h2>
        </div>
      </div>

      <!-- User profile -->
      <div class="user-profile">
        <div class="avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="user-info" :class="{ hidden: isCollapsed }">
          <h3 class="user-name">{{ userName }}</h3>
          <p class="user-role">Développeur</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link
              :to="item.path"
              class="nav-link"
              :class="{ active: currentRoute === item.path }"
              :title="isCollapsed ? item.name : ''"
            >
              <font-awesome-icon :icon="item.icon" class="nav-icon" />
              <span class="nav-text" :class="{ hidden: isCollapsed }">{{
                item.name
              }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <font-awesome-icon icon="sign-out-alt" class="nav-icon" />
          <span class="nav-text" :class="{ hidden: isCollapsed }"
            >Déconnexion</span
          >
        </button>
      </div>
    </aside>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

export default {
  name: "AppSidebar",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { user, logout: authLogout } = useAuth();
    const userProfile = ref(null); // Initialize userProfile as null

    const isOpen = ref(false);
    const isCollapsed = ref(false);

    // Get current route path
    const currentRoute = computed(() => route.path);

    // Get user name and initial
    const userName = computed(() => {
      if (userProfile.value?.displayName) return userProfile.value.displayName;
      if (user.value?.displayName) return user.value.displayName;
      if (user.value?.email) return user.value.email.split("@")[0];
      return "Utilisateur";
    });

    const userInitial = computed(() => {
      return userName.value.charAt(0).toUpperCase();
    });

    // Navigation items
    const navItems = [
      { name: "Tableau de bord", path: "/dashboard", icon: "gauge" },
      { name: "Compétences", path: "/skills", icon: "laptop-code" },
      { name: "Projets", path: "/projects", icon: "project-diagram" },
      { name: "Timeline", path: "/timeline", icon: "history" },
      { name: "Objectifs", path: "/objectives", icon: "bullseye" },
    ];

    // Toggle sidebar on mobile
    const toggleSidebar = () => {
      isOpen.value = !isOpen.value;

      // Prevent scrolling when sidebar is open on mobile
      if (isOpen.value) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    };

    // Close sidebar on mobile
    const closeSidebar = () => {
      isOpen.value = false;
      document.body.classList.remove("sidebar-open");
    };

    // Toggle sidebar collapse on desktop
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
      localStorage.setItem("sidebar-collapsed", isCollapsed.value);
    };

    // Logout function
    const logout = async () => {
      try {
        await authLogout();
        router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    // Close sidebar on route change (mobile only)
    watch(
      () => route.path,
      () => {
        closeSidebar();
      }
    );

    // Check if sidebar was collapsed previously
    onMounted(() => {
      const savedState = localStorage.getItem("sidebar-collapsed");
      if (savedState !== null) {
        isCollapsed.value = savedState === "true";
      }
    });

    return {
      isOpen,
      isCollapsed,
      currentRoute,
      userName,
      userInitial,
      navItems,
      toggleSidebar,
      closeSidebar,
      toggleCollapse,
      logout,
    };
  },
};
</script>

<style scoped>
/* Sidebar wrapper */
.sidebar-wrapper {
  position: relative;
  height: 100%;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #4361ee 0%, #3a56d4 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* Collapsed state */
.sidebar.collapsed {
  width: 70px;
}

/* Sidebar header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User profile */
.user-profile {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.user-info {
  margin-left: 0.75rem;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.8;
  margin: 0;
  white-space: nowrap;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
  margin: 0 0.5rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.3s ease;
}

/* Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Collapse button */
.collapse-btn {
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Mobile toggle button */
.sidebar-toggle-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background-color: var(--primary-color);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: none;
}

/* Overlay for mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Hide elements when collapsed */
.hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Responsive styles */
@media (max-width: 991px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .sidebar-toggle-btn {
    display: flex;
  }

  /* Always show full sidebar on mobile when open */
  .sidebar.open.collapsed {
    width: var(--sidebar-width);
  }

  .sidebar.open.collapsed .hidden {
    opacity: 1;
    width: auto;
  }

  /* Hide collapse button on mobile */
  .sidebar.open.collapsed .collapse-btn {
    display: flex;
  }
}
</style>
