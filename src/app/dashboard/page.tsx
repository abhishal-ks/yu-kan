import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/google-oauth";
import DashboardWorkspace from "@/features/dashboard/dashboard-workspace";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="min-h-screen bg-slate-50 px-5 py-10 text-slate-500"
        >
          Loading your channel workspace…
        </main>
      }
    >
      <AuthenticatedDashboard />
    </Suspense>
  );
}

async function AuthenticatedDashboard() {
  const cookieStore = await cookies();
  const authenticated = Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ||
    cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  );

  if (!authenticated) {
    redirect("/");
  }

  return <DashboardWorkspace />;
}
