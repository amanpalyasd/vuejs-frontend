<script>
import api from '@/services/apiServices'; 
import { addFood, deleteFoodById, updateFoodById } from '@/services/apiServices';
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
        permissions: [],
        roles: [],
      username: sessionStorage.getItem('username') || 'Admin',
      showAddFoodForm: false,
      newFood: {
        name: '',
        description: '',
        ingredients: []        
      },
      foodList: [],
      currentPage: 0,
      itemsPerPage: 5,
      editingFood: null,
      searchTerm: "",
      sortKey: 'name',     // default sort by name
      sortOrder: 'asc',
      availableIngredients: [],
      ingredientInput: {
        name: '',
        newName: '',
        quantity: ''
      },
    };
  },
 created() {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);

      // Log the full decoded token for debugging
      console.log('Decoded JWT Token:', decoded);

      // Assuming the token has roles and permissions fields
      this.roles = decoded.roles || [];
      this.permissions = decoded.permissions || [];

      // Log roles and permissions separately
      console.log('User Roles:', this.roles);
      console.log('User Permissions:', this.permissions);
    } else {
      console.log('No token found in sessionStorage');
    }
  },
 computed: {
    filteredIngredients() {
      return this.newFood.ingredients.filter(ingredient => ingredient.name && ingredient.quantity);
    },
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
    canAccess(permission) {
      return this.permissions.includes(permission);
    },  
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
      const isNew = this.ingredientInput.name === '__new__';
      const name = isNew ? this.ingredientInput.newName.trim() : this.ingredientInput.name;
      const quantity = this.ingredientInput.quantity.trim();
      if (!name || !quantity) {
        alert("Please enter both ingredient name and quantity.");
        return;
      }
      this.newFood.ingredients.push({ name, quantity });
      if (isNew) {
        // Optional: check if already exists to avoid duplicates
        const exists = this.availableIngredients.some(ing => ing.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
          const newId = this.availableIngredients.length > 0 ? Math.max(...this.availableIngredients.map(ing => ing.id)) + 1 : 1;
          this.availableIngredients.push({ id: newId, name });
        }
      }
      this.ingredientInput = {
        name: '',
        newName: '',
        quantity: ''
      };
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
      try {
        if (this.editingFood) {
          // Update logic
          const response = await updateFoodById(this.editingFood.id, this.newFood);
          const index = this.foodList.findIndex(f => f.id === this.editingFood.id);
          if (index !== -1) {
            this.foodList.splice(index, 1, response.data);
          }
          alert('Food updated successfully!');
        } else {
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
      this.editingFood = { ...food }; 
      this.newFood = JSON.parse(JSON.stringify(food)); 
      this.showAddFoodForm = true;
    },        
    async deleteFood(id) {
      if (confirm('Are you sure you want to delete this food item?')) {
        try {
          await deleteFoodById(id);
          this.foodList = this.foodList.filter(food => food.id !== id);
          alert('Food deleted successfully.');
          this.extractIngredientsFromFood();
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    },
    async fetchAllFoods() {
      try {
        const response = await api.get('/foods');
        this.foodList = response.data;
        this.extractIngredientsFromFood(this.foodList);
      } catch (error) {
        console.error('Fetch failed:', error);
        alert('Failed to load foods.');
      }
    },
    extractIngredientsFromFood(foodList) {
      if (!Array.isArray(foodList)) {
        console.warn('extractIngredientsFromFood: foodList is not an array');
        this.availableIngredients = [];
        return;
      }
      const ingredientsSet = new Set();
      foodList.forEach(food => {
        food.ingredients?.forEach(ingredient => {
          ingredientsSet.add(ingredient.name);
        });
      });

      this.availableIngredients = Array.from(ingredientsSet).map((name, index) => ({
        id: index + 1,
        name: name
      }));
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
  watch: {
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
      class="p-3 shadow"
      style="width: 250px; height: 100vh; position: fixed; top: 0; left: 0; overflow-y: auto; z-index: 1000; background-color: orchid;">
      <h5 class="mb-4">👋 Hello, {{ username }}</h5>

      <button v-if="canAccess('ADD_FOOD')" @click="toggleAddFoodForm" class="btn btn-primary btn-sm w-100 mb-3">
        {{ showAddFoodForm ? 'Cancel' : '➕ Add Food' }}
      </button>

      <div v-if="!showAddFoodForm" class="mb-3">
        <label class="form-label">Sort by</label>
        <select v-model="sortKey" class="form-select form-select-sm">
          <option value="name">Name</option>
          <option value="description">Description</option>
        </select>
      </div>
    </aside>
<!-- Main Content Area -->
<div style="margin-left: 250px; flex-grow: 1; height: 100vh; overflow-y: auto;">
  <!-- Sticky Header -->
  <div
    style="position: sticky; top: 0; background: #f8f9fa; z-index: 999; padding: 15px 20px; border-bottom: 1px solid #ccc;"
    class="d-flex align-items-center justify-content-between"
  >
    <h3 class="mb-0">🍽️ Food List</h3>

    <!-- Search input with flex-grow to take available space -->
    <input
      v-model="searchTerm"
      type="text"
      class="form-control mx-3"
      placeholder="Search food by name..."
      style="max-width: 400px; flex-grow: 1;"
    />

    <!-- Logout button on the right -->
    <button class="btn btn-outline-danger btn-sm" @click="logout">
      Logout
    </button>
  </div>

      <!-- Content Area -->
      <div style="padding: 20px;">

        <!-- Add/Edit Form -->
        <div v-if="showAddFoodForm" class="card p-3 mb-3">
          <h5>{{ editingFood ? 'Update Food' : 'Add New Food' }}</h5>
          <input v-model="newFood.name" placeholder="Name" class="form-control mb-2" />
          <textarea v-model="newFood.description" placeholder="Description" class="form-control mb-2" />



          <!-- Add Ingredient Section -->
    <div class="d-flex mb-2">
      <select v-model="ingredientInput.name" class="form-select me-2">
        <option disabled value="">-- Select Ingredient --</option>
        <option v-for="ing in availableIngredients" :key="ing.id" :value="ing.name">
          {{ ing.name }}
        </option>
        <option value="__new__">➕ Add New Ingredient</option>
      </select>

      <!-- Input for new ingredient name if user chooses to add new -->
      <input
        v-if="ingredientInput.name === '__new__'"
        v-model="ingredientInput.newName"
        placeholder="New Ingredient Name"
        class="form-control me-2"
      />

      <!-- Quantity Input -->
      <input
        v-if="ingredientInput.name"
        v-model="ingredientInput.quantity"
        placeholder="Quantity"
        class="form-control me-2"
        type="text"
      />

      <button @click="addIngredient" class="btn btn-success mb-3" >Add</button>
    </div>
 <!-- List of Added Ingredients with Remove Button -->
    <div v-if="filteredIngredients.length">
      <h5>Ingredients Added:</h5>
      <ul class="list-group mb-3">
        <li 
           v-for="(ingredient, index) in newFood.ingredients" 
           :key="index" 
           class="list-group-item d-flex justify-content-between align-items-center">
          {{ ingredient.name }} - {{ ingredient.quantity }}
          <button class="btn btn-danger btn-sm" @click="removeIngredient(index)">Remove</button>
        </li>
      </ul>
      </div>    
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
                <th style="width: 15%;">Name</th>
                <th style="width: 30%;">Description</th>
                <th style="width: 35%;">Ingredients</th>
                <th style="width: 40%;">Actions</th>
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
                  <button v-if="canAccess('UPDATE_FOOD')" @click="startUpdateFood(food)" class="btn btn-warning btn-sm me-1">Edit</button>
                  <button v-if="canAccess('DELETE_FOOD')" @click="deleteFood(food.id)" class="btn btn-danger btn-sm">Delete</button>
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
