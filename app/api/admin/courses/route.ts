import type { NextRequest } from "next/server";
import { getCmsCourses, saveCmsCourses } from "@/lib/cms-courses";
import { requireAdmin } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  return Response.json({ courses: await getCmsCourses() });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const courses = await saveCmsCourses(body.courses);
    await recordActivity(auth.user.id, { type: "admin", title: "Course catalogue saved", detail: `${courses.length} courses`, href: "/admin" });
    revalidatePath("/course-finder");
    return Response.json({ courses });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save courses." },
      { status: 400 },
    );
  }
}
