"use client";

import Link from "next/link";
import { useState } from "react";

type Video = {
  videoId: string;
  title: string;
  publishedAt: string;
  durationSeconds: number | null;
  views: number | null;
  estimatedMinutesWatched: number | null;
  averageViewDuration: number | null;
  averageViewPercentage: number | null;
  subscribersGained: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  watchTimeEfficiencyPercent: number | null;
};

type DeepAnalysis = {
  retentionAnalysis: string;
  subscriberConversionAnalysis: string;
  watchTimeEfficiencyAnalysis: string;
  scriptRecommendations: string[];
};

type AnalysisResult = {
  videos: Video[];
  analysis: DeepAnalysis;
  analyticsPeriod: {
    startDate: string;
    endDate: string;
  };
};

type DashboardProps = {
  authenticated: boolean;
  authError?: string;
};

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (
    typeof value !== "object" ||
    value === null ||
    !("videos" in value) ||
    !("analysis" in value) ||
    !("analyticsPeriod" in value)
  ) {
    return false;
  }

  return (
    isDeepAnalysis(value.analysis) &&
    typeof value.analyticsPeriod === "object" &&
    value.analyticsPeriod !== null &&
    "startDate" in value.analyticsPeriod &&
    typeof value.analyticsPeriod.startDate === "string" &&
    "endDate" in value.analyticsPeriod &&
    typeof value.analyticsPeriod.endDate === "string" &&
    Array.isArray(value.videos) &&
    value.videos.every(isVideo)
  );
}

function isNullableNumber(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isVideo(value: unknown): value is Video {
  if (typeof value !== "object" || value === null) return false;

  return (
    "videoId" in value &&
    typeof value.videoId === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "publishedAt" in value &&
    typeof value.publishedAt === "string" &&
    "durationSeconds" in value &&
    isNullableNumber(value.durationSeconds) &&
    "views" in value &&
    isNullableNumber(value.views) &&
    "estimatedMinutesWatched" in value &&
    isNullableNumber(value.estimatedMinutesWatched) &&
    "averageViewDuration" in value &&
    isNullableNumber(value.averageViewDuration) &&
    "averageViewPercentage" in value &&
    isNullableNumber(value.averageViewPercentage) &&
    "subscribersGained" in value &&
    isNullableNumber(value.subscribersGained) &&
    "likes" in value &&
    isNullableNumber(value.likes) &&
    "comments" in value &&
    isNullableNumber(value.comments) &&
    "shares" in value &&
    isNullableNumber(value.shares) &&
    "watchTimeEfficiencyPercent" in value &&
    isNullableNumber(value.watchTimeEfficiencyPercent)
  );
}

function isDeepAnalysis(value: unknown): value is DeepAnalysis {
  return (
    typeof value === "object" &&
    value !== null &&
    "retentionAnalysis" in value &&
    typeof value.retentionAnalysis === "string" &&
    "subscriberConversionAnalysis" in value &&
    typeof value.subscriberConversionAnalysis === "string" &&
    "watchTimeEfficiencyAnalysis" in value &&
    typeof value.watchTimeEfficiencyAnalysis === "string" &&
    "scriptRecommendations" in value &&
    Array.isArray(value.scriptRecommendations) &&
    value.scriptRecommendations.length === 3 &&
    value.scriptRecommendations.every(
      (recommendation) => typeof recommendation === "string",
    )
  );
}

const authErrorMessages: Record<string, string> = {
  denied: "Google sign-in was cancelled. You can connect whenever you're ready.",
  callback: "We couldn't finish Google sign-in. Please try again.",
};

function formatMetric(value: number | null, fractionDigits = 0) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function Dashboard({ authenticated, authError }: DashboardProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeChannel() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", { method: "POST" });
      const body: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Analysis failed. Please try again.";
        throw new Error(message);
      }

      if (!isAnalysisResult(body)) {
        throw new Error("The analysis response was invalid. Please try again.");
      }

      setResult(body);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="ViewPulse home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-red-600 text-lg font-bold text-white">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-950">
            ViewPulse
          </span>
        </Link>
        <span className="hidden text-sm text-slate-500 sm:block">
          Your channel, with a clearer perspective.
        </span>
        {authenticated && (
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Disconnect
            </button>
          </form>
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
            Connect your channel to see how your recent uploads are performing
            and get practical recommendations grounded in your real video data.
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

          {!authenticated ? (
            <a
              href="/api/auth/login"
              className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <GoogleMark />
              Sign in with Google to Connect YouTube
            </a>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={analyzeChannel}
                disabled={loading}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Spinner /> : <span aria-hidden="true">✦</span>}
                {loading ? "Analyzing your channel…" : "Analyze My Channel"}
              </button>
              <span className="text-sm text-slate-500">
                Your data is only used for this analysis.
              </span>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
              {error.toLowerCase().includes("sign in") && (
                <>
                  {" "}
                  <a
                    className="font-semibold underline underline-offset-2"
                    href="/api/auth/login"
                  >
                    Connect Google
                  </a>
                </>
              )}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-red-100 via-orange-50 to-slate-100 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
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

            <div className="mt-7 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-5">
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
              <p className="px-1 text-xs leading-5 text-slate-500">
                The requested Analytics metrics do not include impressions or
                video CTR. Views are not a substitute for either metric.
              </p>
            </div>
          </div>
        </div>
      </section>

      {result && <Results result={result} />}

      <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Independent insights for independent creators.</span>
        <span>Read-only access · Powered by YouTube and Gemini</span>
      </footer>
    </main>
  );
}

function Results({ result }: { result: AnalysisResult }) {
  return (
    <section className="mb-10 space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-600">
            Deep channel analytics
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Recent video performance
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          YouTube Analytics · {formatDate(result.analyticsPeriod.startDate)} –
          {" "}{formatDate(result.analyticsPeriod.endDate)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AnalysisCard
          label="Retention patterns"
          description={result.analysis.retentionAnalysis}
          accent="red"
        />
        <AnalysisCard
          label="Subscriber conversion"
          description={result.analysis.subscriberConversionAnalysis}
          accent="blue"
        />
        <AnalysisCard
          label="Watch-time efficiency"
          description={result.analysis.watchTimeEfficiencyAnalysis}
          accent="emerald"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-950">Video metrics</h3>
          <p className="mt-1 text-sm text-slate-500">
            Values cover the date range above. A dash means YouTube did not
            return a value for that video.
          </p>
        </div>
        {result.videos.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Title</th>
                  <th scope="col" className="px-4 py-3 text-right">Views</th>
                  <th scope="col" className="px-4 py-3 text-right">Watch time (mins)</th>
                  <th scope="col" className="px-4 py-3 text-right">Avg duration</th>
                  <th scope="col" className="px-4 py-3 text-right">Avg retention</th>
                  <th scope="col" className="px-4 py-3 text-right">Subs gained</th>
                  <th scope="col" className="px-4 py-3 text-right">Likes</th>
                  <th scope="col" className="px-4 py-3 text-right">Comments</th>
                  <th scope="col" className="px-4 py-3 text-right">Shares</th>
                  <th scope="col" className="px-4 py-3 text-right">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.videos.map((video) => (
                  <tr key={video.videoId} className="align-top hover:bg-slate-50">
                    <th scope="row" className="max-w-sm px-5 py-4 font-medium text-slate-900">
                      <p className="line-clamp-2">{video.title}</p>
                      <time
                        dateTime={video.publishedAt}
                        className="mt-1 block text-xs font-normal text-slate-500"
                      >
                        Published {formatDate(video.publishedAt)}
                      </time>
                    </th>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatMetric(video.views)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatMetric(video.estimatedMinutesWatched)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatDuration(video.averageViewDuration)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {video.averageViewPercentage === null
                        ? "—"
                        : `${formatMetric(video.averageViewPercentage, 1)}%`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatMetric(video.subscribersGained)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatMetric(video.likes)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatMetric(video.comments)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {formatMetric(video.shares)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
                      {video.watchTimeEfficiencyPercent === null
                        ? "—"
                        : `${formatMetric(video.watchTimeEfficiencyPercent, 1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-slate-600">
            No recent uploads were found for this channel.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="font-semibold text-slate-950">
          Three structural ideas for your next scripts
        </h3>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {result.analysis.scriptRecommendations.map((recommendation, index) => (
            <li
              key={recommendation}
              className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                {index + 1}
              </span>
              {recommendation}
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}

function AnalysisCard({
  label,
  description,
  accent,
}: {
  label: string;
  description: string;
  accent: "red" | "blue" | "emerald";
}) {
  const accentClasses = {
    red: "border-t-red-500",
    blue: "border-t-blue-500",
    emerald: "border-t-emerald-500",
  };

  return (
    <article
      className={`rounded-2xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm ${accentClasses[accent]}`}
    >
      <h3 className="font-semibold text-slate-950">{label}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
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
