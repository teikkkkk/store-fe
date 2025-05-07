import React, { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Review, ReviewListProps } from '@/types/review';
import { Button } from './ui/button';
import ReviewForm from './ReviewForm';

interface UserInfo {
  id: string;
}

export default function ReviewList({ reviews, loading, onEdit, onDelete }: ReviewListProps) {
  const [editReviewId, setEditReviewId] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/user-info/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userInfo = await response.json();
          setCurrentUser(userInfo);
        }
       
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Đang tải đánh giá...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-4">Chưa có đánh giá nào cho sản phẩm này</div>;
  }

  const handleEditClick = (reviewId: string) => {
    setEditReviewId(reviewId);
  };

  const handleCancelEdit = () => {
    setEditReviewId(null);
  };

  const handleEditSubmit = async (reviewId: string, values: { rating: number; comment: string }) => {
    await onEdit(reviewId, values);
    setEditReviewId(null);
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6">
          {editReviewId === review.id ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <ReviewForm
                initialValues={review ? { 
                  rating: review.rating, 
                  comment: review.comment 
                } : undefined}
                onSubmit={async (values) => await handleEditSubmit(review.id, values)}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{review.username}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {currentUser && currentUser.id === review.user_id && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(review.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
                          onDelete(review.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-2">{review.comment}</p>
              <p className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}