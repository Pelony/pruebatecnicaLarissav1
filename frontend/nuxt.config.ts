import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['./app/assets/css/main.css'],
  typescript: { strict: true },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    apiInternalBaseUrl:
      process.env.NUXT_API_INTERNAL_BASE_URL || "http://backend:3000",
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    },
  },
});
