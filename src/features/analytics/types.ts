export type Video = {
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

export type DeepAnalysis = {
  retentionAnalysis: string;
  subscriberConversionAnalysis: string;
  watchTimeEfficiencyAnalysis: string;
  scriptRecommendations: string[];
};

export type AnalysisResult = {
  videos: Video[];
  analysis: DeepAnalysis;
  analyticsPeriod: {
    startDate: string;
    endDate: string;
  };
};
