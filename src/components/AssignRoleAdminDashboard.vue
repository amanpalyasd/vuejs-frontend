<script>
import { fetchUsersWithRoles, createRoleAPI } from '@/services/apiServices';
import { fetchAllRoles, fetchAllPermissions, updateUserRole, deleteUser } from '@/services/apiServices';

export default {
  data() {
    return {
      showCreateRoleForm: false,
      username: "Admin",
      users: [],
      allRoles: [],
      allPermissions: ['read', 'write', 'update', 'delete', 'execute'], // example permissions list
      selectedPermissions: []
    };
  },
  computed: {
    filteredRoles() {
      // Exclude ADMIN from roles list
      return this.allRoles.filter(role => role !== 'ADMIN');
    },
  },
  methods: {
    async deleteUser(userId) {
      if (confirm("Are you sure you want to delete this user?")) {
        try {
          await deleteUser(userId);
           this.users = this.users.filter(user => user.id !== userId);
        } catch (error) {
          console.error("Failed to delete user:", error);
          alert("Failed to delete user");
        }
      }
    },
      
    toggleCreateRoleForm() {
      this.showCreateRoleForm = !this.showCreateRoleForm;
      if (this.showCreateRoleForm) {
        // Clear previous form data when opening form
        this.newRoleName = '';
        this.selectedPermissions = [];
      }
    },
     async fetchPermissions() {
      try {
        this.allPermissions = await fetchAllPermissions();
      } catch (error) {
        console.error("Failed to load permissions:", error);
      }
    },
     async createRole() {
      if (!this.newRoleName.trim()) {
        alert("Role name is required.");
        return;
      }
      if (this.selectedPermissions.length === 0) {
        alert("Please select at least one permission.");
        return;
      }
      try {
        const token = sessionStorage.getItem('token');
        console.log('Token ::::', token);
        const payload = {
          roleName: this.newRoleName.trim(),
          permissions: this.selectedPermissions
        };
        await createRoleAPI(payload, token);
        alert("Role created successfully!");
        this.toggleCreateRoleForm();
        this.fetchRoles(); // Refresh roles list
      } catch (error) {
        console.error("Error creating role:", error);
        alert("Failed to create role.");
      }
    },
     cancelCreateRole() {
      this.showCreateRoleForm = false;
    },

    async fetchUsers() {
      try {
        const data = await fetchUsersWithRoles();
        this.users = data.map(user => ({
          id: user.id,
          username: user.username,
          currentRole: user.roleName,
          selectedRole: ""
        }))
        .sort((a, b) => (a.currentRole === 'ADMIN' ? -1 : b.currentRole === 'ADMIN' ? 1 : 0));
      } catch (error) {
        console.error("Failed to load users:", error);
      }
  },
  async fetchRoles() {
      try {
        const roles = await fetchAllRoles();
        this.allRoles = roles;
      } catch (error) {
        console.error("Failed to load roles:", error);
      }
    },
     logout() {
      sessionStorage.clear();
      this.$router.push('/'); // Redirect to login page
    },
     async changeUserRole(user) {
      if (user.selectedRole && user.selectedRole !== user.currentRole) {
       try {
          console.log(`Changing role for ${user.username} to ${user.selectedRole}`);

         await updateUserRole(user.id, user.selectedRole);
          user.currentRole = user.selectedRole;
          user.selectedRole = "";
           alert(`Role updated for user ${user.username}`);
        }catch (error) {
          alert(`Failed to update role for user ${user.username}`);

          // Reset dropdown selection on failure
          user.selectedRole = "";
        } 
      }
    }
  },
  mounted() {
    this.fetchUsers();
    this.fetchRoles();
    this.fetchPermissions();
  }
};
</script>


<template>
  <div>
    <!-- Navbar Header -->
    <nav class="navbar navbar-expand-lg shadow-sm px-4 d-flex justify-content-between" style="background-color: #d4edda; margin: 0;">
  <div class="d-flex align-items-center">
    <strong class="me-2">👤 Welcome, {{ username }}</strong>
  </div>
  <div>
    <button class="btn me-2" @click="showCreateRoleForm = !showCreateRoleForm" style="background-color: #28a745; color: white;">
      ➕ Create Role
    </button>
    <button class="btn" @click="logout" style="background-color: #155724; color: white;">
      Logout
    </button>
  </div>
</nav>

<!-- Create Role Form -->
   <div v-if="showCreateRoleForm" class="p-3 border mt-3">
  <h5>Create New Role</h5>

  <textarea
    v-model="newRoleName"
    placeholder="Enter Role Name"
    rows="2"
    class="form-control mb-3"
  ></textarea>

  <div>
    <label>Select Permissions</label>
    <div v-for="perm in allPermissions" :key="perm" class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        :id="`perm-${perm}`"
        :value="perm"
        v-model="selectedPermissions"
      />
      <label class="form-check-label" :for="`perm-${perm}`">
        {{ perm }}
      </label>
    </div>
  </div>

  <p>Selected permissions: {{ selectedPermissions.join(', ') }}</p>

  <button class="btn btn-primary" @click="createRole">Save Role</button>
  <button class="btn btn-secondary ms-2" @click="cancelCreateRole">Cancel</button>
</div>




<!-- Users & Role Management -->
    <div v-if="!showCreateRoleForm" class="container mt-4">
      <h3 class="mb-3">User Role Management</h3>
      <table class="table table-bordered">
        <thead class="table-success">
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Current Role</th>
            <th>Change Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.currentRole }}</td>
            <td>
              <select class="form-select" 
              v-model="user.selectedRole" 
              @change="changeUserRole(user)"
              :disabled="user.currentRole === 'ADMIN'"
              >
                <option disabled value="">-- Select New Role --</option>
                <option v-for="role in filteredRoles" :key="role" :value="role" >{{ role }}</option>
              </select>
            </td>
             <td>
      <button 
        class="btn btn-danger btn-sm" 
        @click="deleteUser(user.id)" 
        :disabled="user.currentRole === 'ADMIN'">
        Delete
      </button>
    </td>
          </tr>
        </tbody>
      </table>
    </div>



  


  </div>
</template>
