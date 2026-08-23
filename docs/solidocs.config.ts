import { defineConfig } from "solidocs"

export default defineConfig({
  title: "Solidocs",
  description: "SolidJS + Rolldown powered static site generator",
  basePath: "/solidocs/",
  themeConfig: {
    logo: "https://solidjs.com/img/logo.svg",
    siteTitle: "Solidocs",
    nav: [
      { text: "Guide", link: "/guide/getting-started/" },
      { text: "GitHub", link: "https://github.com/akku1139/solidocs/" },
    ],
  },
})
