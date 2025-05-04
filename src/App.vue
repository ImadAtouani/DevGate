<template>
  <div id="app">
    <div v-if="isReady">
      <template v-if="isAuthenticated">
        <div class="app-container">
          <AppSidebar />
          <div class="content-wrapper">
            <AppHeader />
            <main class="main-content">
              <router-view v-slot="{ Component }">
                <component :is="Component" />
              </router-view>
            </main>
          </div>
        </div>
      </template>
      <template v-else>
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </template>
    </div>
    <div v-else class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Chargement de l'application...</p>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "./composables/useAuth";
import AppHeader from "./components/layout/AppHeader.vue";
import AppSidebar from "./components/layout/AppSidebar.vue";

export default {
  name: "App",
  components: {
    AppHeader,
    AppSidebar,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { user, isAuthenticated, checkAuth } = useAuth();
    const isReady = ref(false);

    // Check authentication status on app mount
    onMounted(async () => {
      try {
        await checkAuth();
        isReady.value = true;
      } catch (error) {
        console.error("Auth check failed:", error);
        isReady.value = true; // Still set ready to true to avoid infinite loading
      }
    });

    // Watch for authentication changes and redirect accordingly
    watch(
      isAuthenticated,
      (newIsAuthenticated) => {
        if (isReady.value) {
          const publicRoutes = ["login", "register", "forgot-password"];
          const isPublicRoute = publicRoutes.includes(route.name);

          if (!newIsAuthenticated && !isPublicRoute) {
            router.push("/login");
          } else if (newIsAuthenticated && isPublicRoute) {
            router.push("/dashboard");
          }
        }
      },
      { immediate: true }
    );

    return {
      user,
      isAuthenticated,
      isReady,
    };
  },
};
</script>

<style>
:root {
  /* Color variables */
  --primary-color: #4361ee;
  --secondary-color: #6c757d;
  --success-color: #2ecc71;
  --danger-color: #ef476f;
  --warning-color: #ffc107;
  --info-color: #3498db;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --gray-color: #6c757d;

  /* Layout variables */
  --header-height: 60px;
  --sidebar-width: 250px;
  --footer-height: 60px;

  /* Font variables */
  --font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  font-family: var(--font-family);
  font-size: 16px;
  line-height: 1.5;
  color: var(--dark-color);
  background-color: #f5f7fb;
}

#app {
  height: 100%;
}

.app-container {
  display: flex;
  height: 100%;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fb;
  min-height: calc(100vh - var(--header-height));
}

/* Loading container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fb;
}

/* Responsive adjustments */
@media (min-width: 992px) {
  .content-wrapper {
    margin-left: var(--sidebar-width);
  }

  .content-wrapper.sidebar-collapsed {
    margin-left: 70px;
  }
}

/* Button styles */
.btn {
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: #3a56d4;
  border-color: #3a56d4;
}

.btn-outline-primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-primary:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Card styles */
.card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.card-header {
  background-color: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1rem 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

/* Form styles */
.form-control,
.form-select {
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
}

/* Table styles */
.table {
  --bs-table-striped-bg: rgba(0, 0, 0, 0.02);
}

/* Badge styles */
.badge {
  font-weight: 500;
  padding: 0.35em 0.65em;
  border-radius: 6px;
}

/* Utility classes */
.text-primary {
  color: var(--primary-color) !important;
}

.bg-primary {
  background-color: var(--primary-color) !important;
}

.border-primary {
  border-color: var(--primary-color) !important;
}

/* Page title styles */
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--dark-color);
}

/* Empty state styles */
.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Prevent body scrolling when sidebar is open on mobile */
body.sidebar-open {
  overflow: hidden;
}
</style>
