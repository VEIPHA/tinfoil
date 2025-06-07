// Simple types for MVP
export interface Film {
  title: string;
  year?: number;
  country: string;
  director?: string;
  cast_members?: string[]; // Will be stored as JSON in DB
  genre?: string;
  release_date?: string;
  wikipedia_url?: string;
}

export interface ScrapingResult {
  success: boolean;
  films: Film[];
  errors: string[];
  total_scraped: number;
}
