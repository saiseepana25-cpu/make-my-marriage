import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/current-user";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create an account" };

export default async function Page() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="signup" />;
}
