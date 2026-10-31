import type { AnalysisResult } from "@/features/analytics/types";
import type { ReactNode } from "react";

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

export default function AnalysisResults({ result }: { result: AnalysisResult }) {
  return (
    <section aria-labelledby="analysis-heading" className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-red-600">
            Deep channel analytics
          </p>
          <h2
            id="analysis-heading"
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-950"
          >
            Recent video performance
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          YouTube Analytics · {formatDate(result.analyticsPeriod.startDate)} –{" "}
          {formatDate(result.analyticsPeriod.endDate)}
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
                    <MetricCell>{formatMetric(video.views)}</MetricCell>
                    <MetricCell>{formatMetric(video.estimatedMinutesWatched)}</MetricCell>
                    <MetricCell>{formatDuration(video.averageViewDuration)}</MetricCell>
                    <MetricCell>
                      {video.averageViewPercentage === null
                        ? "—"
                        : `${formatMetric(video.averageViewPercentage, 1)}%`}
                    </MetricCell>
                    <MetricCell>{formatMetric(video.subscribersGained)}</MetricCell>
                    <MetricCell>{formatMetric(video.likes)}</MetricCell>
                    <MetricCell>{formatMetric(video.comments)}</MetricCell>
                    <MetricCell>{formatMetric(video.shares)}</MetricCell>
                    <MetricCell>
                      {video.watchTimeEfficiencyPercent === null
                        ? "—"
                        : `${formatMetric(video.watchTimeEfficiencyPercent, 1)}%`}
                    </MetricCell>
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

function MetricCell({ children }: { children: ReactNode }) {
  return (
    <td className="whitespace-nowrap px-4 py-4 text-right tabular-nums text-slate-700">
      {children}
    </td>
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
