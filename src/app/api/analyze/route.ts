import { GoogleGenAI } from "@google/genai";
import { cookies } from "next/headers";
import { google, youtube_v3 } from "googleapis";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createOAuthClient,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/google-oauth";

type VideoMetrics = {
  views: number | null;
  estimatedMinutesWatched: number | null;
  averageViewDuration: number | null;
  averageViewPercentage: number | null;
  subscribersGained: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
};

type Video = VideoMetrics & {
  videoId: string;
  title: string;
  publishedAt: string;
  durationSeconds: number | null;
  watchTimeEfficiencyPercent: number | null;
};

type DeepAnalysis = {
  retentionAnalysis: string;
  subscriberConversionAnalysis: string;
  watchTimeEfficiencyAnalysis: string;
  scriptRecommendations: string[];
};

const analyticsMetrics = [
  "views",
  "estimatedMinutesWatched",
  "averageViewDuration",
  "averageViewPercentage",
  "subscribersGained",
  "likes",
  "comments",
  "shares",
] as const;

const emptyMetrics: VideoMetrics = {
  views: null,
  estimatedMinutesWatched: null,
  averageViewDuration: null,
  averageViewPercentage: null,
  subscribersGained: null,
  likes: null,
  comments: null,
  shares: null,
};

const emptyAnalysis: DeepAnalysis = {
  retentionAnalysis:
    "There is not enough recent analytics data to assess audience retention.",
  subscriberConversionAnalysis:
    "There is not enough recent analytics data to assess subscriber conversion.",
  watchTimeEfficiencyAnalysis:
    "There is not enough recent analytics data to assess watch-time efficiency.",
  scriptRecommendations: [
    "Review your strongest-performing uploads and identify a specific audience question to answer.",
    "State the video's promise early, then make each section deliver on that promise.",
    "Use a clear ending that naturally leads viewers to a relevant next video.",
  ],
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function dateDaysAgoUTC(daysAgo: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function parseDurationSeconds(duration: string | null | undefined) {
  if (!duration) return null;

  const match =
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(duration);
  if (!match) return null;

  return (
    Number(match[1] ?? 0) * 3600 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0)
  );
}

function parseMetric(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAnalyticsRow(row: unknown): [string, VideoMetrics] | null {
  if (!Array.isArray(row) || typeof row[0] !== "string") return null;

  const values = row.slice(1);
  const metrics = Object.fromEntries(
    analyticsMetrics.map((metric, index) => [metric, parseMetric(values[index])]),
  ) as VideoMetrics;

  return [row[0], metrics];
}

function parseGeminiAnalysis(text: string): DeepAnalysis {
  const parsed: unknown = JSON.parse(text);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("retentionAnalysis" in parsed) ||
    typeof parsed.retentionAnalysis !== "string" ||
    !("subscriberConversionAnalysis" in parsed) ||
    typeof parsed.subscriberConversionAnalysis !== "string" ||
    !("watchTimeEfficiencyAnalysis" in parsed) ||
    typeof parsed.watchTimeEfficiencyAnalysis !== "string" ||
    !("scriptRecommendations" in parsed) ||
    !Array.isArray(parsed.scriptRecommendations) ||
    parsed.scriptRecommendations.length !== 3 ||
    !parsed.scriptRecommendations.every(
      (recommendation) => typeof recommendation === "string",
    )
  ) {
    throw new Error("Gemini returned analysis in an unexpected format.");
  }

  return {
    retentionAnalysis: parsed.retentionAnalysis,
    subscriberConversionAnalysis: parsed.subscriberConversionAnalysis,
    watchTimeEfficiencyAnalysis: parsed.watchTimeEfficiencyAnalysis,
    scriptRecommendations: parsed.scriptRecommendations,
  };
}

function getLast90Days() {
  return {
    startDate: dateDaysAgoUTC(90),
    endDate: dateDaysAgoUTC(1),
  };
}

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return jsonError("Please sign in with Google to analyze your channel.", 401);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured.");
    return jsonError("The AI analysis service is not configured.", 500);
  }

  try {
    const auth = createOAuthClient();
    auth.setCredentials({
      ...(accessToken ? { access_token: accessToken } : {}),
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    });

    const accessResult = await auth.getAccessToken();
    if (!accessResult.token) {
      return jsonError("Your Google session expired. Please sign in again.", 401);
    }

    const youtube = google.youtube({ version: "v3", auth });
    const ytAnalytics = google.youtubeAnalytics({ version: "v2", auth });

    const channelResponse = await youtube.channels.list({
      part: ["contentDetails"],
      mine: true,
      maxResults: 1,
    });
    const uploadsPlaylistId =
      channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return jsonError("No YouTube channel was found for this Google account.", 404);
    }

    const uploadsResponse = await youtube.playlistItems.list({
      part: ["contentDetails"],
      playlistId: uploadsPlaylistId,
      maxResults: 10,
    });
    const videoIds = (uploadsResponse.data.items ?? [])
      .map((item) => item.contentDetails?.videoId)
      .filter((videoId): videoId is string => Boolean(videoId));

    const videoResponse = videoIds.length
      ? await youtube.videos.list({
        part: ["snippet", "contentDetails"],
        id: videoIds,
        maxResults: videoIds.length,
      })
      : null;

    const dataVideos = new Map(
      (videoResponse?.data.items ?? [])
        .filter(
          (video): video is youtube_v3.Schema$Video & {
            id: string;
            snippet: youtube_v3.Schema$VideoSnippet & {
              title: string;
              publishedAt: string;
            };
          } =>
            Boolean(
              video.id && video.snippet?.title && video.snippet?.publishedAt,
            ),
        )
        .map((video) => [
          video.id,
          {
            videoId: video.id,
            title: video.snippet.title,
            publishedAt: video.snippet.publishedAt,
            durationSeconds: parseDurationSeconds(video.contentDetails?.duration),
          },
        ]),
    );
    const uploadedVideos = videoIds.flatMap((videoId) => {
      const video = dataVideos.get(videoId);
      return video ? [video] : [];
    });

    const analyticsByVideoId = new Map<string, VideoMetrics>();
    if (uploadedVideos.length > 0) {
      const { startDate, endDate } = getLast90Days();
      const report = await ytAnalytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        dimensions: "video",
        metrics: analyticsMetrics.join(","),
        filters: `video==${uploadedVideos.map((video) => video.videoId).join(",")}`,
        maxResults: uploadedVideos.length,
      });

      for (const row of report.data.rows ?? []) {
        const parsedRow = parseAnalyticsRow(row);
        if (parsedRow) {
          analyticsByVideoId.set(parsedRow[0], parsedRow[1]);
        }
      }
    }

    const videos: Video[] = uploadedVideos.map((video) => {
      const metrics = analyticsByVideoId.get(video.videoId) ?? emptyMetrics;
      const potentialWatchMinutes =
        metrics.views !== null && video.durationSeconds !== null
          ? metrics.views * (video.durationSeconds / 60)
          : null;
      const watchTimeEfficiencyPercent =
        potentialWatchMinutes !== null &&
          potentialWatchMinutes > 0 &&
          metrics.estimatedMinutesWatched !== null
          ? (metrics.estimatedMinutesWatched / potentialWatchMinutes) * 100
          : null;

      return {
        ...video,
        ...metrics,
        watchTimeEfficiencyPercent,
      };
    });

    let analysis = emptyAnalysis;
    if (videos.length > 0) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        config: { responseMimeType: "application/json" },
        contents: [
          "You are a YouTube audience-retention and content-strategy analyst. " +
          "Analyze only the supplied video-level analytics for the last 90 days. " +
          "Return valid JSON with exactly these properties: retentionAnalysis " +
          "(string), subscriberConversionAnalysis (string), " +
          "watchTimeEfficiencyAnalysis (string), and scriptRecommendations " +
          "(array of exactly 3 strings).\n\n" +
          "For retentionAnalysis, identify videos with high views but low " +
          "averageViewPercentage as possible hook/retention failures, while " +
          "explaining that views are not click-through rate. CTR and impressions " +
          "were not requested or supplied, so do not claim to measure CTR. " +
          "For subscriberConversionAnalysis, compare subscribersGained per view " +
          "only where views are greater than zero and identify high-conversion " +
          "value content. For watchTimeEfficiencyAnalysis, interpret " +
          "watchTimeEfficiencyPercent as estimatedMinutesWatched divided by " +
          "(views multiplied by video length in minutes); compare it with " +
          "averageViewPercentage and note that these measures may differ. " +
          "Provide three deep structural recommendations for the user's next " +
          "video scripts based on observed patterns. Do not invent causes or " +
          "fill missing metrics; describe insufficient or missing data clearly.\n\n" +
          JSON.stringify(videos),
        ],
      });

      const responseText = result.text?.trim();
      if (!responseText) {
        throw new Error("Gemini returned an empty analysis.");
      }
      analysis = parseGeminiAnalysis(responseText);
    }

    const response = NextResponse.json(
      { videos, analysis, analyticsPeriod: getLast90Days() },
      { headers: { "Cache-Control": "no-store" } },
    );
    const updatedAccessToken = auth.credentials.access_token;
    const expiryDate = auth.credentials.expiry_date;
    if (updatedAccessToken && updatedAccessToken !== accessToken) {
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        updatedAccessToken,
        getAuthCookieOptions(
          expiryDate
            ? Math.max(0, Math.floor((expiryDate - Date.now()) / 1000))
            : 60 * 60,
        ),
      );
    }

    return response;
  } catch (error) {
    console.error("Deep channel analysis failed:", error);
    return jsonError(
      "We couldn't complete the deep channel analysis. Please try again.",
      502,
    );
  }
}
