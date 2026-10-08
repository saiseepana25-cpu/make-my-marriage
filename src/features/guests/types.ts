import type { RsvpStatus } from "@/types/domain";

export interface GuestInput {
  name: string;
  phone?: string;
  email?: string;
  familyName?: string;
  numberInvited?: number;
  numberAttending?: number;
  rsvpStatus: RsvpStatus;
  notes?: string;
}
export interface WeddingGuest extends GuestInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  rsvpUpdatedAt?: string;
}
export interface GuestSummary { total: number; pending: number; attending: number; notAttending: number }
export interface GuestList {
  guests: WeddingGuest[];
  families: string[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
