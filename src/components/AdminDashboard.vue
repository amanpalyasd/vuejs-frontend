<script>
import api from '@/services/apiServices'; // make sure this path is correct
import { addFood, deleteFoodById, updateFoodById } from '@/services/apiServices';

export default {
  data() {
    return {
      username: sessionStorage.getItem('username') || 'Admin',
      showAddFoodForm: false,
      newFood: {
        name: '',
        description: '',
        ingredients: [{ name: '', quantity: '' }]
      },
      foodList: [],
       currentPage: 0,
      itemsPerPage: 5,
      editingFood: null,
      searchTerm: "",
       sortKey: 'name',     // default sort by name
      sortOrder: 'asc',
    };
  },
computed: {
  paginatedFoods() {  

     const filtered = this.foodList.filter(food =>
      food.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
        let compareA = a[this.sortKey];
        let compareB = b[this.sortKey];

        if (typeof compareA === 'string') compareA = compareA.toLowerCase();
        if (typeof compareB === 'string') compareB = compareB.toLowerCase();

        if (compareA < compareB) return this.sortOrder === 'asc' ? -1 : 1;
        if (compareA > compareB) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return sorted.slice(start, end);
  },



  
  totalPages() {
    const filtered = this.foodList.filter(food =>
      food.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return Math.ceil(filtered.length / this.itemsPerPage);
  }
},
methods: {
  goToPage(page) {
    console.log('Switching to page:', page);
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  },
    logout() {
      sessionStorage.clear();
      this.$router.push('/'); // Redirect to login page
    },
    toggleAddFoodForm() {
      this.showAddFoodForm = !this.showAddFoodForm;
    },
    addIngredient() {
      this.newFood.ingredients.push({ name: '', quantity: '' });
    },
    removeIngredient(index) {
      this.newFood.ingredients.splice(index, 1);
    },
    resetForm() {
      this.newFood = {
        name: '',
        description: '',
        ingredients: [{ name: '', quantity: '' }]
      };
    },
    async submitAddOrUpdateFood() {
      if (!this.newFood.name || !this.newFood.description) {
        alert('Please fill in all required fields');
        return;
      }
      for (const ing of this.newFood.ingredients) {
        if (!ing.name || !ing.quantity) {
          alert('Please fill all ingredient fields');
          return;
        }
      }
    try{
      if (this.editingFood) {
      // Update logic
      const response = await updateFoodById(this.editingFood.id, this.newFood);
      const index = this.foodList.findIndex(f => f.id === this.editingFood.id);
      if (index !== -1) {
        this.foodList.splice(index, 1, response.data);
      }
      alert('Food updated successfully!');
    }
      else {
      // Add logic
      const response = await addFood(this.newFood);
      this.foodList.push(response.data);
      alert('Food added successfully!');
    }
        this.resetForm();
        this.showAddFoodForm = false;
        this.editingFood = null;
      } catch (error) {
        console.error('Submit food failed:', error);
        alert('Failed to submit food.');
      }
    },
      startUpdateFood(food) {
      this.editingFood = { ...food }; // keep a shallow copy for reference
      this.newFood = JSON.parse(JSON.stringify(food)); // deep copy for editing
      this.showAddFoodForm = true;
    },        
    async deleteFood(id) {
      if (confirm('Are you sure you want to delete this food item?')) {
        try {
          await deleteFoodById(id);
          this.foodList = this.foodList.filter(food => food.id !== id);
          alert('Food deleted successfully.');
        } catch (error) {
          console.error('Delete failed:', error);
          alert('Failed to delete food.');
        }
      }
    },
    async fetchAllFoods() {
      try {
        const response = await api.get('/foods');
        this.foodList = response.data;
      } catch (error) {
        console.error('Fetch failed:', error);
        alert('Failed to load foods.');
    }
  },
  changeSort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    }
  },
  mounted() {
    this.fetchAllFoods();
  },
  watch:{
    searchTerm() {
    this.currentPage = 0;
  }
  }
};
</script>
<template>
  <div class="d-flex" style="min-height: 100vh; overflow: hidden;">
    <!-- Sidebar -->
    <aside
      class="bg-light p-3 shadow"
      style="width: 250px; height: 100vh; position: fixed; top: 0; left: 0; overflow-y: auto; z-index: 1000;"
    >
      <h5 class="mb-4">👋 Hello, {{ username }}</h5>

      <button @click="toggleAddFoodForm" class="btn btn-primary btn-sm w-100 mb-3">
        {{ showAddFoodForm ? 'Cancel' : '➕ Add Food' }}
      </button>

      <div v-if="!showAddFoodForm" class="mb-3">
        <label class="form-label">Sort by</label>
        <select v-model="sortKey" class="form-select form-select-sm">
          <option value="name">Name</option>
          <option value="description">Description</option>
        </select>
      </div>

      <button @click="logout" class="btn btn-danger btn-sm w-100">Logout</button>
    </aside>

    <!-- Main Content Area -->
    <div style="margin-left: 250px; flex-grow: 1; height: 100vh; overflow-y: auto;">
      <!-- Sticky Header -->
      <div
        style="position: sticky; top: 0; background: white; z-index: 999; padding: 15px 20px; border-bottom: 1px solid #ccc;"
      >
        <h3 class="mb-3">🍽️ Food List</h3>
        <input
          v-model="searchTerm"
          type="text"
          class="form-control"
          placeholder="Search food by name..."
        />
      </div>

      <!-- Content Area -->
      <div style="padding: 20px;">
        <!-- Add/Edit Form -->
        <div v-if="showAddFoodForm" class="card p-3 mb-3">
          <h5>{{ editingFood ? 'Update Food' : 'Add New Food' }}</h5>
          <input v-model="newFood.name" placeholder="Name" class="form-control mb-2" />
          <textarea v-model="newFood.description" placeholder="Description" class="form-control mb-2" />

          <div v-for="(ingredient, index) in newFood.ingredients" :key="index" class="d-flex mb-2">
            <input v-model="ingredient.name" placeholder="Ingredient" class="form-control me-1" />
            <input v-model="ingredient.quantity" placeholder="Quantity" class="form-control me-1" />
            <button class="btn btn-outline-danger btn-sm" @click="removeIngredient(index)">X</button>
          </div>

          <button @click="addIngredient" class="btn btn-outline-primary btn-sm mb-3">
            + Add Ingredient
          </button>
          <br />
          <button @click="submitAddOrUpdateFood" class="btn btn-success btn-sm me-2">
            {{ editingFood ? 'Update' : 'Add' }}
          </button>
          <button @click="resetForm" class="btn btn-secondary btn-sm">Reset</button>
        </div>

        <!-- Food Table -->
        <div v-else>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th style="width: 25%;">Name</th>
                <th style="width: 35%;">Description</th>
                <th>Ingredients</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="food in paginatedFoods" :key="food.id">
                <td>{{ food.name }}</td>
                <td>{{ food.description }}</td>
                <td>
                  <ul class="mb-0">
                    <li v-for="ing in food.ingredients" :key="ing.name">
                      {{ ing.name }} - {{ ing.quantity }}
                    </li>
                  </ul>
                </td>
                <td>
                  <button @click="startUpdateFood(food)" class="btn btn-warning btn-sm me-1">Edit</button>
                  <button @click="deleteFood(food.id)" class="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 0 }">
                <a class="page-link" @click="goToPage(currentPage - 1)">Previous</a>
              </li>
              <li
                class="page-item"
                v-for="n in totalPages"
                :key="n"
                :class="{ active: currentPage === n - 1 }"
              >
                <a class="page-link" @click="goToPage(n - 1)">{{ n }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
                <a class="page-link" @click="goToPage(currentPage + 1)">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
