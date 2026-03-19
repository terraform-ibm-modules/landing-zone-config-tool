import { defineConfig, transformWithEsbuild } from "vite";
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
            async transform(code, id) {
                if (!id.match(/src\/.*\.js$/)) return null;

                // Use the exposed transform from vite, instead of directly
                // transforming with esbuild
                return transformWithEsbuild(code, id, {
                    loader: "jsx",
                    jsx: "automatic",
                });
            },
        },
    ],
    optimizeDeps: {
        force: true,
        esbuildOptions: {
            loader: {
                ".js": "jsx",
            },
        },
    },
    quietDeps: true,
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern',
                // these warnings are internal to carbon, nothing we can do about them
                silenceDeprecations: ['mixed-decls', 'global-builtin'],
            },
        }
    }
});
