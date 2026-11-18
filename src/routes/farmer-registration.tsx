import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FarmerRegistrationForm } from "@/components/FarmerRegistrationForm";

export const Route = createFileRoute("/farmer-registration")({
  head: () => ({ meta: [
    { title: "Farmer Registration — Kheti" },
    { name: "description", content: "Register your name, mobile number and farming question with Kheti." },
    { property: "og:title", content: "Farmer Registration — Kheti" },
    { property: "og:description", content: "Send your farming question and register your contact details." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FarmerRegistrationPage,
});

function FarmerRegistrationPage() {
  const navigate = useNavigate();
  return <FarmerRegistrationForm repeat onComplete={() => { void navigate({ to: "/" }); }} />;
}
