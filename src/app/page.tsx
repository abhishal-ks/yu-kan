import { Suspense } from "react";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/google-oauth";
import LandingPage from "@/features/landing/landing-page";

type HomeProps = {
  searchParams: Promise<{ authError?: string }>;
};

export default function Home({ searchParams }: HomeProps) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="min-h-screen bg-slate-50 px-5 py-10 text-slate-500"
        >
          Loading ViewPulse…
        </main>
      }
    >
      <LandingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LandingContent({ searchParams }: HomeProps) {
  const [cookieStore, params] = await Promise.all([cookies(), searchParams]);
  const authenticated = Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ||
    cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  );

  return (
    <LandingPage authenticated={authenticated} authError={params.authError} />
  );
}
