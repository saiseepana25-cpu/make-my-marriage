export interface PublicWedding {
  groomName: string;
  brideName: string;
  weddingDate: string;
  location: string;
  websiteSlug: string;
}

export interface PublicEvent {
  id: string;
  name: string;
  startAt: string;
  endAt?: string;
  venue: string;
  location?: string;
  description?: string;
  livestreamUrl?: string;
}

export interface WebsiteEvents {
  events: PublicEvent[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
