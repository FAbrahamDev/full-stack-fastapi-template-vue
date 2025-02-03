import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const colorMode = ref(localStorage.getItem("colorMode") || "light-mode");

  function setColorMode(mode: "light-mode" | "dark-mode") {
    colorMode.value = mode;
    localStorage.setItem("colorMode", mode);
    document.documentElement.classList.toggle(
      "dark-mode",
      mode === "dark-mode",
    );
  }

  // Initialize theme
  setColorMode(colorMode.value as "light-mode" | "dark-mode");

  return {
    colorMode,
    setColorMode,
  };
});
