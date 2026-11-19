import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { ActivityHistory } from "@/components/student/activity-history";

export const metadata: Metadata = { title: "My History", robots: { index: false, follow: false } };
export default async function HistoryPage() {
  if (!await getCurrentUser()) redirect("/login?next=%2Fstudent%2Fhistory");
  return <ActivityHistory />;
}
