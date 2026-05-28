import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Gemini Bridge",
  description: "Project documentation for Gemini Bridge.",
  outDir: "./.vitepress/dist",
  cleanUrls: true,
  ignoreDeadLinks: [
    /^\.\/\.env\.local$/,
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Architecture", link: "/architecture" },
      { text: "API", link: "/api-documentation" },
      { text: "Roadmap", link: "/roadmap" },
    ],
    sidebar: [
      {
        text: "Project Docs",
        items: [
          { text: "Overview", link: "/" },
          { text: "Architecture", link: "/architecture" },
          { text: "API Documentation", link: "/api-documentation" },
          { text: "Roadmap", link: "/roadmap" },
        ],
      },
      {
        text: "Workflow Notes",
        items: [
          { text: "CI/CD Local Guide", link: "/cicd-local-guide" },
          { text: "Implementation Plan", link: "/implementation-plan" },
          { text: "Walkthrough", link: "/walkthrough" },
        ],
      },
    ],
    socialLinks: [],
    search: {
      provider: "local",
    },
  },
});
