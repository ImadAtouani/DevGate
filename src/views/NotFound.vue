<template>
  <div class="not-found">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <div class="error-content">
            <h1 class="error-code">404</h1>
            <h2 class="error-title">Page non trouvée</h2>
            <p class="error-message">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <router-link to="/dashboard" class="btn btn-primary btn-lg mt-3">
              <font-awesome-icon icon="home" class="me-2" />
              Retour au tableau de bord
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fb;
  padding: 2rem 0;
}

.error-content {
  padding: 3rem;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: var(--gray-color);
  margin-bottom: 2rem;
}
</style>
