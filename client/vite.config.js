import { defineConfig, transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
  },
  base: "/landing-zone-config-tool/",
  plugins: [
    react(),
    {
      name: "treat-js-files-as-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;

        return transformWithOxc(code, id, {
          lang: "jsx",
        });
      },
    },
  ],
});
