export interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

export interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onEdit: (reviewId: string ,values: { rating: number; comment: string }) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
}