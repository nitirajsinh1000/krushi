import { createFileRoute } from "@tanstack/react-router";
import { PesticideSelector } from "@/components/pesticide/PesticideSelector";
import { useEffect, useState } from "react";
import { FarmerRegistrationForm } from "@/components/FarmerRegistrationForm";

const TITLE = "Kheti | Pesticide Finder & Farming Tools";
const DESCRIPTION =
  "Kheti farming tools: find crop protection doses, identify weeds, convert land units and calculate fertilizer and plant spacing.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "theme-color", content: "#1F3D1C" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  component: Index,
});

function Index() {
  const [registered, setRegistered] = useState<boolean | null>(null);
  useEffect(() => {
    setRegistered(Boolean(localStorage.getItem("farmerMobile") && localStorage.getItem("farmerName")));
  }, []);
  if (registered === null) return <div className="min-h-screen bg-background" />;
  if (!registered) return <FarmerRegistrationForm onComplete={() => setRegistered(true)} />;
  return <PesticideSelector />;
}
