import Link from "next/link";

type LandingPageProps = {
  authenticated: boolean;
  authError?: string;
};

const authErrorMessages: Record<string, string> = {
  denied: "Google sign-in was cancelled. You can connect whenever you're ready.",
  callback: "We couldn't finish Google sign-in. Please try again.",
};

export default function LandingPage({
  authenticated,
  authError,
}: LandingPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <Link href="/" className="flex items-center gap-3" aria-label="ViewPulse home">
          <span className="grid size-10 place-items-center rounded-xl bg-red-600 text-lg font-bold text-white">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-950">
            ViewPulse
          </span>
        </Link>
        {authenticated ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open dashboard
          </Link>
        ) : (
          <span className="hidden text-sm text-slate-500 sm:block">
            Your channel, with a clearer perspective.
          </span>
        )}
      </header>

      <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.85fr] lg:py-16">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
            <span className="size-1.5 rounded-full bg-red-600" />
            YouTube performance, made useful
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Make your next
            <span className="block text-red-600">video your best.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Connect your channel to see how recent uploads are performing and
            get practical recommendations grounded in your video data.
          </p>

          {authError && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {authErrorMessages[authError] ??
                "There was a problem connecting your account. Please try again."}
            </p>
          )}

          {authenticated ? (
            <Link
              href="/dashboard"
              className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Go to your channel analysis
            </Link>
          ) : (
            <a
              href="/api/auth/login"
              className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <GoogleMark />
              Sign in with Google to Connect YouTube
            </a>
          )}
          <p className="mt-4 text-sm text-slate-500">
            Read-only access. Your data is used to generate your analysis.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-red-100 via-orange-50 to-slate-100 blur-2xl" />
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Channel insights
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Built around your uploads
                </h2>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600">
                <ChartMark />
              </span>
            </div>
            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                What you’ll get
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <CheckMark />
                  Your 10 latest uploads and 90-day channel metrics
                </li>
                <li className="flex gap-3">
                  <CheckMark />
                  Retention and subscriber-conversion patterns
                </li>
                <li className="flex gap-3">
                  <CheckMark />
                  Three data-grounded script recommendations
                </li>
              </ul>
            </div>
            <p className="mt-4 px-1 text-xs leading-5 text-slate-500">
              The requested Analytics metrics do not include impressions or
              video CTR. Views are not a substitute for either metric.
            </p>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Independent insights for independent creators.</span>
        <span>Read-only access · Powered by YouTube and Gemini</span>
      </footer>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.5H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#4A90E2"
        d="M12.6 27.5a12 12 0 0 1 0-7V15H5.8a20 20 0 0 0 0 18l6.8-5.5Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.5C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

function ChartMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 19V5m0 14h17M8 15l4-4 3 2 5-6" />
      <path d="M17 7h3v3" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-emerald-600"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42.007L3.3 9.194a1 1 0 1 1 1.4-1.428l4.08 4 6.51-6.47a1 1 0 0 1 1.414-.006Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
