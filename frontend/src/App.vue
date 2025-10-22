<template>
  <div id="app">
    <!-- Navigation -->
    <Navigation />
    
    <!-- Main Content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from './components/Navigation.vue'
</script>
