import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ReviewFormProps {
  initialValues?: {
    rating: number;
    comment: string;
  };
  onSubmit: (values: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
  hasReviewed?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ initialValues, onSubmit, onCancel, hasReviewed }) => {
  const [rating, setRating] = useState<number>(initialValues?.rating || 0);
  const [comment, setComment] = useState<string>(initialValues?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setRating(initialValues.rating);
      setComment(initialValues.comment);
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ rating, comment });
      if (!initialValues) {
        setRating(0);
        setComment('');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasReviewed && !initialValues) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bạn đã đánh giá sản phẩm này rồi. Mỗi người chỉ được đánh giá một lần.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
        placeholder="Viết đánh giá của bạn về sản phẩm..."
        className="min-h-[100px]"
      />

      <div className="flex space-x-2">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Đang gửi..." : initialValues ? "Cập nhật" : "Gửi đánh giá"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;