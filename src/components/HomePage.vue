<script>
import { register, login } from '../services/apiServices';
import { jwtDecode } from 'jwt-decode';


export default {
  data() {
    return {
      username: '',
      password: ''
    };  
  },
  methods: {
    async submitRegister() {
      try {
        const response = await register(this.username, this.password);
        console.log(response);
        alert('Registration successful!');
        this.username = '';
        this.password = '';
      } catch (error) {
        alert(`Error: ${error}`);
      }
},

// Login Functionality
    async submitLogin() {
      try {
        const response = await login(this.username, this.password);
        const decoded = jwtDecode(response.token);
        const token = response.token;

        console.log("roles::",decoded.roles);
        console.log("username :::", decoded.username);

        sessionStorage.setItem('username', decoded.username);
        sessionStorage.setItem('token', token);

        // Save roles array (optional: stringify if needed later)
        sessionStorage.setItem('roles', JSON.stringify(decoded.roles));
        console.log('Login success:', response);

       // Define role-to-route mapping
       const roleRouteMap = {
      ADMIN: '/adminDashboard',
      SENIOR_CHEF: '/seniorChefDashboard',
      JUNIOR_CHEF: '/juniorChefDashboard',
      USER: '/userDashboard'
       };

        // Find first matching role in order of priority
        const priorityOrder = ['ADMIN', 'SENIOR_CHEF', 'JUNIOR_CHEF', 'USER'];
        const matchedRole = priorityOrder.find(role => decoded.roles.includes(role));

      if (matchedRole && roleRouteMap[matchedRole]) {
      this.$router.push(roleRouteMap[matchedRole]);
      } else {
      // Fallback in case no matching route found
      alert("No matching role found. Redirecting to default page.");
      this.$router.push('/');
     }

      } catch (error) {
        alert(`Login Error: ${error}`);
      }
    }
  }
};

</script>

<template>
  <div>
    <!-- Header -->
    <nav class="navbar navbar-light bg-light shadow-sm mb-4">
      <div class="container d-flex align-items-center justify-content-center">
        <h2 class="m-0">Food Recipe</h2>
      </div>
    </nav>

    <!-- Auth Form -->
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card p-4 shadow-sm">
            <form @submit.prevent>
              <div class="mb-3">
                <input
                  v-model="username"
                  type="text"
                  class="form-control"
                  placeholder="Username"
                  required
                />
              </div>
              <div class="mb-3">
                <input
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Password"
                  required
                />
              </div>

              <div class="d-flex justify-content-between">
                <button type="button" class="btn btn-success w-50 me-2" @click="submitRegister">
                  Register
                </button>
                <button type="button" class="btn btn-primary w-50" @click="submitLogin">
                  Login
                </button>
              </div>
            </form>

            <div v-if="message" class="mt-3 alert" :class="messageType">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



