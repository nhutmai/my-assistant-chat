import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Gemini Bridge",
  description: "Project documentation for Gemini Bridge.",
  outDir: "./.vitepress/dist",
  cleanUrls: true,
  ignoreDeadLinks: [
    /^\.\/\.env\.local$/,
    /^\.\/API_DOCUMENTATION$/,
    /^\.\/ARCHITECTURE$/,
    /^\.\/ROADMAP$/,
  ],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/" },
      { text: "Architecture", link: "/architecture" },
      { text: "API", link: "/api-documentation" },
      { text: "Roadmap", link: "/roadmap" },
      { text: "Agent Rules", link: "/agent-rules" },
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
        text: "Agent Rules",
        items: [
          { text: "AGENTS", link: "/agent-rules" },
          { text: "CLAUDE", link: "/claude-rules" },
          { text: "GEMINI", link: "/gemini-rules" },
        ],
      },
      {
        text: ".agent Skills",
        items: [
          { text: "Add Service", link: "/agent-skills-add-service" },
          { text: "Add Webhook", link: "/agent-skills-add-webhook" },
          { text: "Bento Skill", link: "/agent-skills-bento" },
          { text: "Bento Design", link: "/agent-skills-bento-design" },
          { text: "Debug API", link: "/agent-skills-debug-api" },
          { text: "Frontend Component", link: "/agent-skills-frontend-component" },
          { text: "Notion Logging", link: "/agent-skills-notion-logging" },
        ],
      },
      {
        text: ".claude Skills",
        items: [
          { text: "Add Service", link: "/claude-skills-add-service" },
          { text: "Add Webhook", link: "/claude-skills-add-webhook" },
          { text: "Bento Skill", link: "/claude-skills-bento" },
          { text: "Bento Design", link: "/claude-skills-bento-design" },
          { text: "Debug API", link: "/claude-skills-debug-api" },
          { text: "Frontend Component", link: "/claude-skills-frontend-component" },
          { text: "Notion Logging", link: "/claude-skills-notion-logging" },
        ],
      },
      {
        text: "GitNexus Skills",
        items: [
          { text: "CLI", link: "/claude-skills-gitnexus-cli" },
          { text: "Debugging", link: "/claude-skills-gitnexus-debugging" },
          { text: "Exploring", link: "/claude-skills-gitnexus-exploring" },
          { text: "Guide", link: "/claude-skills-gitnexus-guide" },
          { text: "Impact Analysis", link: "/claude-skills-gitnexus-impact-analysis" },
          { text: "Refactoring", link: "/claude-skills-gitnexus-refactoring" },
        ],
      },
    ],
    socialLinks: [],
    search: {
      provider: "local",
    },
  },
});
