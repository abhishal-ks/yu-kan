"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AnalyticsChat from "@/features/chat/analytics-chat";
import AnalysisResults from "@/features/analytics/analysis-results";
import type {
  AnalysisResult,
  DeepAnalysis,
  Video,
} from "@/features/analytics/types";

type ChannelProfile = {
  title: string | null;
  thumbnailUrl: string | null;
};

function isChannelProfile(value: unknown): value is ChannelProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    (typeof value.title === "string" || value.title === null) &&
    "thumbnailUrl" in value &&
    (typeof value.thumbnailUrl === "string" || value.thumbnailUrl === null)
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

export default function DashboardWorkspace() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelProfile, setChannelProfile] = useState<ChannelProfile | null>(
    null,
  );
  const [channelProfileLoading, setChannelProfileLoading] = useState(true);
  const [channelProfileError, setChannelProfileError] = useState<string | null>(
    null,
  );
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChannelProfile() {
      try {
        const response = await fetch("/api/auth/channel", {
          signal: controller.signal,
        });
        const body: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof body === "object" &&
              body !== null &&
              "error" in body &&
              typeof body.error === "string"
              ? body.error
              : "We couldn't load your YouTube channel details.";
          throw new Error(message);
        }

        if (
          typeof body !== "object" ||
          body === null ||
          !("channel" in body) ||
          !isChannelProfile(body.channel)
        ) {
          throw new Error("The channel profile response was invalid.");
        }

        setChannelProfile(body.channel);
      } catch (caughtError) {
        if (controller.signal.aborted) return;
        setChannelProfileError(
          caughtError instanceof Error
            ? caughtError.message
            : "We couldn't load your YouTube channel details.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setChannelProfileLoading(false);
        }
      }
    }

    void loadChannelProfile();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!result) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function analyzeChannel() {
    setLoading(true);
    setError(null);
    setResult(null);

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
        <Link href="/" className="flex items-center gap-3" aria-label="ViewPulse home">
          <span className="grid size-10 place-items-center rounded-xl bg-red-600 text-lg font-bold text-white">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-950">
            ViewPulse
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {channelProfileLoading && (
            <span aria-live="polite" className="hidden text-sm text-slate-500 sm:block">
              Loading channel…
            </span>
          )}
          {channelProfile && (
            <div className="flex min-w-0 items-center gap-2">
              {channelProfile.thumbnailUrl ? (
                <Image
                  src={channelProfile.thumbnailUrl}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-sm font-semibold text-red-700"
                >
                  {(channelProfile.title ?? "Y").charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className="max-w-36 truncate text-sm font-medium text-slate-700"
                title={channelProfile.title ?? "YouTube channel"}
              >
                {channelProfile.title ?? "YouTube channel"}
              </span>
            </div>
          )}
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Disconnect
            </button>
          </form>
        </div>
      </header>

      <section className="flex flex-1 flex-col justify-center py-10 sm:py-14">
        <div className="mx-auto w-full max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-600">
            Channel workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Understand what’s working in your latest videos.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Analyze your 10 most recent uploads and their available analytics
            from the last 90 days. Your report will include recommendations
            and a chat grounded in those metrics.
          </p>

          {channelProfileError && (
            <p
              role="alert"
              className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900"
            >
              {channelProfileError}
              {channelProfileError.toLowerCase().includes("sign in again") && (
                <>
                  {" "}
                  <a
                    className="font-semibold underline underline-offset-2"
                    href="/api/auth/login"
                  >
                    Reconnect Google
                  </a>
                </>
              )}
            </p>
          )}

          <button
            type="button"
            onClick={analyzeChannel}
            disabled={loading}
            className="mt-7 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Spinner /> : <span aria-hidden="true">✦</span>}
            {loading ? "Analyzing your channel…" : result ? "Analyze Again" : "Analyze My Channel"}
          </button>
          <p className="mt-3 text-sm text-slate-500">
            Read-only channel access · Your data is only used for this analysis
          </p>

          {loading && (
            <p role="status" className="mt-6 text-sm text-slate-600">
              Fetching your recent uploads and preparing your channel insights…
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-800"
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
      </section>

      {result && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Channel analysis and questions"
          className="scroll-mt-6 space-y-10 pb-10 outline-none"
        >
          <AnalysisResults result={result} />
          <AnalyticsChat />
        </section>
      )}

      <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Independent insights for independent creators.</span>
        <span>Read-only access · Powered by YouTube and Gemini</span>
      </footer>
    </main>
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
