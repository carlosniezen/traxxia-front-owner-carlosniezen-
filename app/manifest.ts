import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Traxxia Personal",
    short_name: "Traxxia",
    description:
      "El sistema operativo estratégico del ejecutivo: horizontes temporales y el framework S.T.R.A.T.E.G.I.C.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0E1116",
    theme_color: "#0E1116",
    lang: "es",
  };
}
