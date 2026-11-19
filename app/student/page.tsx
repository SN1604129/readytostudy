import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudentDashboard } from "@/components/student/student-dashboard";
import { getCurrentUser, safeUser } from "@/lib/server-auth";
import { getCmsDestinations } from "@/lib/cms-destinations";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Track your Ready to Study planning progress, saved courses and document checklist.",
};

export default async function StudentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <StudentDashboard user={safeUser(user)} destinations={await getCmsDestinations()} />;
}
