import type { MetadataRoute } from "next";

const { appName, description } = {
  appName: "Superteam Brasil",
  description:
    "Comunidade Solana no Brasil. Aprenda, construa e cresça no ecossistema Solana com cursos, bounties e uma rede de builders e criadores.",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: "Superteam BR",
    description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    background_color: "#ffffff",
    theme_color: "#facc15",
    orientation: "portrait-primary",
    lang: "pt-BR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
  };
}
