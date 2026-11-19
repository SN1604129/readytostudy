import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getCurrentUser, safeUser } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Manage Ready to Study destinations, images and interactive platform features.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role !== "admin") redirect("/student");

  return <AdminDashboard user={safeUser(user)} />;
}
