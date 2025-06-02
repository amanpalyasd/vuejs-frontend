<script>
import api from '@/services/apiServices';

export default {
  name: 'UserDashboard',
  data() {
    return {
      username: '',
      foodList: [],
      searchQuery: '',
      sortKey: 'name',        
      sortOrder: 'asc',       
      currentPage: 1,
      pageSize: 5,
      errorMessage: ''
    };
  },
computed: {
    filteredFoods() {
      let filtered = this.foodList.filter(food =>
        food.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        food.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
       // Sort
      filtered.sort((a, b) => {
        const fieldA = a[this.sortKey].toLowerCase();
        const fieldB = b[this.sortKey].toLowerCase();

        if (this.sortOrder === 'asc') {
          return fieldA.localeCompare(fieldB);
        } else {
          return fieldB.localeCompare(fieldA);
        }
      });

      return filtered;
    },
     paginatedFoods() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredFoods.slice(start, start + this.pageSize);
    },

    totalPages() {
      return Math.ceil(this.filteredFoods.length / this.pageSize);
    }
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

    setSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },

    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    logout() {
      sessionStorage.clear();
      this.$router.push('/');
    }
  },

  created() {
    this.username = sessionStorage.getItem('username');
  },

  mounted() {
    this.fetchAllFoods();
  }
};
</script>



<template>
  <div>
    <!-- ✅ Header -->
    <nav class="navbar navbar-expand-lg shadow-sm px-4 d-flex justify-content-between" style="background-color: #d4edda;">
      <div class="d-flex align-items-center">
        <strong class="me-2">👤 Welocome, {{ username }}</strong>
      </div>
      <button class="btn" @click="logout" style="background-color: #155724; color: white; border: none;">Logout</button>
    </nav>



   <div class="container mt-3 d-flex justify-content-between align-items-center flex-wrap">
  <!-- 🔍 Search Input -->
  <input
    v-model="searchQuery"
    class="form-control me-2 mb-2"
    placeholder="🔍 Search food by name..."
    style="max-width: 300px;"
  />

  <!-- 🔃 Sort Dropdown + Label -->
  <div class="d-flex align-items-center mb-2" style="max-width: 300px;">
    <span class="me-2">Sort by:</span>
    <select v-model="sortKey" class="form-select form-select-sm" style="min-width: 160px;">
      <option value="name">Name</option>
      <option value="description">Description</option>
    </select>
  </div>
</div>


      <!-- ✅ Food List Table with Scroll -->
      <div class="container mt-2">
        <h3 class="mb-3">🍲 Food Items</h3>
        <div style="max-height: 300px; overflow-y: auto;">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th @click="setSort('name')" style="cursor: pointer;">Name ⬍</th>
                <th @click="setSort('description')" style="cursor: pointer;">Description ⬍</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="food in paginatedFoods" :key="food.id">
                <td>{{ food.name }}</td>
                <td>{{ food.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>





      <!-- ✅ Pagination -->
      <nav class="mt-3">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>