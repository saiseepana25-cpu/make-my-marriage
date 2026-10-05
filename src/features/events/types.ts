export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venue: string;
  location?: string;
  livestreamUrl?: string;
  status?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventInput {
  name: string;
  venue: string;
  startAt: string;
  endAt?: string;
  description?: string;
  location?: string;
  livestreamUrl?: string;
  status?: string;
}
