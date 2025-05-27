<script>
import api from '@/services/apiServices';

export default {
  name: 'UserDashboard',
  data() {
    return {
      username: '',
      foodList: [],
      errorMessage: ''
    };
  },
  created() {
    this.username = sessionStorage.getItem('username') || 'User';
  },
  mounted() {
    this.fetchAllFoods();
  },
  methods: {
    async fetchAllFoods() {
      try {
        const response = await api.get('/foods');
        this.foodList = response.data;
      } catch (error) {
        console.error('Fetch failed:', error);
        this.errorMessage = 'Failed to load foods.';
        alert(this.errorMessage);
      }
    },
     logout() {
      sessionStorage.clear(); // Clear token and username
      this.$router.push('/'); // Redirect to login page
    }
  }
};
</script>

<template>
  <div>
    <!-- ✅ Header -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-4 d-flex justify-content-between">
      <div class="d-flex align-items-center">
        <strong class="me-2">👤 {{ username }}</strong>
      </div>
      <button class="btn btn-outline-danger" @click="logout">Logout</button>
    </nav>

    <!-- ✅ Food List -->
    <div class="container mt-4">
      <h3 class="mb-4">🍲 Food Items</h3>
      <div class="row">
        <div
          class="col-md-4 mb-4"
          v-for="food in foodList"
          :key="food.id"
        >
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ food.name }}</h5>
              <p class="card-text">{{ food.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>