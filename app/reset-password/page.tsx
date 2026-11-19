import type { Metadata } from "next";
import { PasswordRecovery } from "@/components/auth/password-recovery";
export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export default function ResetPasswordPage() { return <PasswordRecovery reset />; }
