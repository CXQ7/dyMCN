import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  root: "src",
  publicDir: "../public",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3005,
    host: true,
    proxy: {
      "/dylive": {
        target: "https://live.douyin.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dylive/, ""),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const ua = req.headers["user-agent"] || "";
            const isMobile = /mobile|android|iphone|ipad/i.test(ua);
            if (isMobile) {
              proxyReq.setHeader(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0"
              );
            }
            proxyReq.setHeader("Referer", "https://live.douyin.com/");
          });
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              const newCookie = setCookie.map((cookie) =>
                cookie
                  .replace(/; Domain=[^;]+/i, "")
                  .replace(/; SameSite=None/, "")
                  .replace(/; Secure=true/i, "")
              );
              proxyRes.headers["set-cookie"] = newCookie;
            }
          });
        },
      },
      "/socket": {
        target: "wss://webcast5-ws-web-lf.douyin.com",
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/socket/, ""),
        configure: (proxy) => {
          proxy.on("proxyReqWs", (proxyReq, req) => {
            const ua = req.headers["user-agent"] || "";
            const isMobile = /mobile|android|iphone|ipad/i.test(ua);
            if (isMobile) {
              proxyReq.setHeader(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0"
              );
            }
          });
        },
      },
    },
  },
  build: {
    outDir: "../dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-scroll-area",
          ],
          charts: ["recharts"],
          utils: ["clsx", "sonner"],
          dycast: ["pako", "ws"],
        },
      },
    },
  },
});
