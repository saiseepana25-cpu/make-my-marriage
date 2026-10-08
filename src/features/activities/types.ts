import type { ActivitySource } from "@/types/domain";

export interface ActivityInput {
  title: string;
  description?: string;
  relatedEventId?: string;
  activityType?: string;
}
export interface WeddingActivity extends ActivityInput {
  id: string;
  sourceType: ActivitySource;
  createdBy: string;
  authorName: string;
  createdAt: string;
  event?: { id: string; name: string };
  canModify: boolean;
}
export interface ActivityList {
  activities: WeddingActivity[];
  events: { id: string; name: string }[];
  pagination: { page: number; limit: number; total: number; pages: number };
  asOf: number;
}
