<template>
  <NuxtLoadingIndicator color="#3B5A3B" />
  <AppNavbar />
  <main>
    <NuxtPage />
  </main>
  <AppFooter />
</template>

<style>
body {
  font-family: "Rubik", sans-serif;
}
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>
