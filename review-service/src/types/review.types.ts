export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string; // ISO date format
  updatedAt: string; // ISO date format
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewQueryParams {
  productId?: string;
  userId?: string;
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}