import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forwards frontend API calls to the Node/Express backend during dev
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
