<template>
    <v-container fluid class="login-background">
      
      <!-- Dodajemy obraz na górze strony -->
      <div class="header-image">
        <img src="/NapisUBB.png" alt="Napis UBB" />
      </div>
  
      <div class="login-wrapper">
        <v-card class="login-card">
            
          <v-card-title class="headline text-center">Zaloguj się</v-card-title>
          
          <!-- Error message -->
          <v-alert
            v-if="authStore.error"
            type="error"
            class="mb-4"
            closable
            @click:close="authStore.clearError()"
          >
            {{ authStore.error }}
          </v-alert>
  
          <v-form v-model="formValid" @submit.prevent="submitForm">
            <v-text-field
              v-model="nickname"
              label="Nickname"
              type="text"
              :rules="nicknameRules"
              required
              prepend-icon="mdi-account"
              :disabled="authStore.isLoading"
            ></v-text-field>
  
            <v-text-field
             v-model="password"
             :type="showPassword ? 'text' : 'password'"
             label="Hasło"
             :rules="passwordRules"
             required
             :prepend-icon="showPassword ? 'mdi-lock-open-variant' : 'mdi-lock'"
             @click:prepend="togglePasswordVisibility"
             :disabled="authStore.isLoading"
            />
            
            <div class="d-flex flex-column gap-2">
              <v-btn 
                :disabled="!formValid || authStore.isLoading" 
                :loading="authStore.isLoading"
                color="deep-purple" 
                type="submit"
                prepend-icon="mdi-login"
                block
              >
                Zaloguj
              </v-btn>
              
              <v-btn 
                variant="outlined"
                color="deep-purple" 
                @click="showRegister = !showRegister"
                prepend-icon="mdi-account-plus"
                block
                :disabled="authStore.isLoading"
              >
                {{ showRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się' }}
              </v-btn>
            </div>
          </v-form>
          
          <!-- Registration Form -->
          <v-expand-transition>
            <div v-if="showRegister" class="mt-4">
              <v-divider class="my-4"></v-divider>
              <h3 class="text-center mb-4">Rejestracja</h3>
              
              <v-form v-model="registerFormValid" @submit.prevent="submitRegisterForm">
                <v-text-field
                  v-model="registerNickname"
                  label="Nickname"
                  type="text"
                  :rules="nicknameRules"
                  required
                  prepend-icon="mdi-account"
                  :disabled="authStore.isLoading"
                ></v-text-field>
                
                <v-text-field
                  v-model="registerPassword"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  label="Hasło"
                  :rules="passwordRules"
                  required
                  :prepend-icon="showRegisterPassword ? 'mdi-lock-open-variant' : 'mdi-lock'"
                  @click:prepend="toggleRegisterPasswordVisibility"
                  :disabled="authStore.isLoading"
                />
                
                <v-text-field
                  v-model="confirmPassword"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  label="Potwierdź hasło"
                  :rules="confirmPasswordRules"
                  required
                  prepend-icon="mdi-lock-check"
                  :disabled="authStore.isLoading"
                />
                
                <v-btn 
                  :disabled="!registerFormValid || authStore.isLoading" 
                  :loading="authStore.isLoading"
                  color="success" 
                  type="submit"
                  prepend-icon="mdi-account-plus"
                  block
                  class="mt-2"
                >
                  Zarejestruj się
                </v-btn>
              </v-form>
            </div>
          </v-expand-transition>
        </v-card>
      </div>
      
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  // Login form
  const nickname = ref('')
  const password = ref('')
  const formValid = ref(false)
  const showPassword = ref(false)
  
  // Registration form
  const showRegister = ref(false)
  const registerNickname = ref('')
  const registerPassword = ref('')
  const confirmPassword = ref('')
  const registerFormValid = ref(false)
  const showRegisterPassword = ref(false)
  
  // Validation rules
  const nicknameRules = [
    v => !!v || 'Nickname jest wymagany',
    v => v.length >= 3 || 'Nickname musi mieć co najmniej 3 znaki',
    v => v.length <= 20 || 'Nickname może mieć maksymalnie 20 znaków',
  ]
  
  const passwordRules = [
    v => !!v || 'Hasło jest wymagane',
    v => v.length >= 5 || 'Hasło musi mieć co najmniej 5 znaków',
    v => v.length <= 20 || 'Hasło może mieć maksymalnie 20 znaków',
  ]
  
  const confirmPasswordRules = computed(() => [
    v => !!v || 'Potwierdzenie hasła jest wymagane',
    v => v === registerPassword.value || 'Hasła muszą być identyczne',
  ])
  
  // Methods
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }
  
  const toggleRegisterPasswordVisibility = () => {
    showRegisterPassword.value = !showRegisterPassword.value
  }
  
  const submitForm = async () => {
    if (!formValid.value) return
    
    try {
      await authStore.login(nickname.value, password.value)
      // Redirect to game page on successful login
      router.push('/game')
    } catch (error) {
      console.error('Login failed:', error)
      // Error is already handled by the store and displayed in the UI
    }
  }
  
  const submitRegisterForm = async () => {
    if (!registerFormValid.value) return
    
    try {
      await authStore.register({
        nickname: registerNickname.value,
        password: registerPassword.value,
      })
      // After successful registration and auto-login, redirect to game
      router.push('/game')
    } catch (error) {
      console.error('Registration failed:', error)
      // Error is already handled by the store and displayed in the UI
    }
  }
  </script>
  
  <style scoped>
  /* Ustawienie tła */
  .login-background {
    background-image: url('/public/ubb.jpg'); /* Podmień na swoją ścieżkę */
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column; /* Ustawiamy elementy w kolumnie */
    position: relative; /* Dodane, żeby pozycjonowanie obrazu było względne do tego kontenera */
  }
  
  /* Kontener logowania */
  .login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: relative; /* Ustawiamy kontener logowania w relatywnej pozycji */
    z-index: 1; /* Ustawiamy kartę na wierzchu */
  }
  
  /* Kontener dla obrazu nagłówka, ustawiamy go wyżej */
  .header-image {
    width: 100%;
    text-align: center;
    position: absolute;
    top: 20px; /* Ustawiamy obrazek na samej górze */
    z-index: 0; /* Ustawiamy obrazek pod kartą logowania */
  }
  
  /* Zmieniamy styl na kartę logowania */
  .login-card {
    padding: 20px;
    max-width: 600px;
    width: 100%;
  }
  </style>
  