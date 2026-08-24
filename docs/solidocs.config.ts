import { defineConfig } from "solidocs"

export default defineConfig({
  title: "Solidocs",
  description: "SolidJS + Rolldown powered static site generator",
  basePath: "/solidocs/",
  site: {
    url: "https://akku1139.github.io",
  },
  sitemap: true,
  themeConfig: {
    logo: "https://solidjs.com/img/logo.svg",
    siteTitle: "Solidocs",
    lastUpdated: true,
    editLink: {
      repo: "akku1139/solidocs",
      dir: "docs",
      text: "Edit this page",
    },
    nav: [
      { text: "Guide", link: "/guide/getting-started/" },
      { text: "GitHub", link: "https://github.com/akku1139/solidocs/" },
    ],
  },
})
