export interface ReviewResponseDTO {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  qualification: number;
  comment: string;
  review_date: string; // ISO format
}

export interface ReviewsPaginatedResponse {
  total: number;
  pages: number;
  first: number;
  next: number | null;
  prev: number | null;
  data: ReviewResponseDTO[];
}
