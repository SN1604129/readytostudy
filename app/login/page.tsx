import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Ready to Study student or admin portal.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <section className="bg-ice px-4 py-16 sm:px-6 md:py-24">
      <AuthPanel mode="login" nextPath={typeof params.next === "string" ? params.next : ""} googleClientId={process.env.GOOGLE_CLIENT_ID?.trim()} />
    </section>
  );
}
