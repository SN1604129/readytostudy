import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Ready to Study student or admin portal account.",
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <section className="bg-ice px-4 py-16 sm:px-6 md:py-24">
      <AuthPanel mode="signup" nextPath={typeof params.next === "string" ? params.next : ""} googleClientId={process.env.GOOGLE_CLIENT_ID?.trim()} />
    </section>
  );
}
