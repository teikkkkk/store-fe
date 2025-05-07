'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { Review } from '@/types/review';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category_id: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

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

  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const userReview = reviews.find(review => review.user_id === currentUser.id);
      setHasReviewed(!!userReview);
    }
  }, [currentUser, reviews]);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      toast.error('ID sản phẩm không hợp lệ');
      router.push('/');
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}/`);
        if (response.status === 404) {
          toast.error('Không tìm thấy sản phẩm');
          router.push('/');
          return;
        }
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}/reviews/`);
        if (response.status === 404) {
          setReviews([]);
          return;
        }
        if (!response.ok) {
          throw new Error('Không thể tải đánh giá sản phẩm');
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Không thể tải đánh giá sản phẩm');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        router.push('/auth/login');
        return;
      }
  
      const response = await fetch('http://localhost:8000/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({
          product_id: id,
          quantity: quantity, 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Không thể thêm sản phẩm vào giỏ hàng');
      }
  
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleReviewSubmit = async (values: { rating: number; comment: string }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
        router.push('/auth/login'); 
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/${id}/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: values.rating,
          comment: values.comment,
        }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.detail || 'Không thể gửi đánh giá');
      }

      toast.success('Đã gửi đánh giá thành công');
      const reviewsResponse = await fetch(`http://localhost:8000/api/products/${id}/reviews/`);
      const newReviews = await reviewsResponse.json();
      setReviews(newReviews);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể gửi đánh giá');
    }
  };

  const handleEditReview = async (reviewId: string, values: { rating: number; comment: string }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để chỉnh sửa đánh giá');
        router.push('/auth/login');
        return;
      }

      // Kiểm tra xem review có tồn tại không
      const reviewExists = reviews.find(review => review.id === reviewId);
      if (!reviewExists) {
        toast.error('Không tìm thấy đánh giá này');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/${id}/reviews/${reviewId}/edit/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.status === 404) {
        toast.error('Không tìm thấy đánh giá này');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể chỉnh sửa đánh giá');
      }

      toast.success('Đã chỉnh sửa đánh giá thành công');
      const reviewsResponse = await fetch(`http://localhost:8000/api/products/${id}/reviews/`);
      const newReviews = await reviewsResponse.json();
      setReviews(newReviews);
    } catch (error) {
      console.error('Error editing review:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể chỉnh sửa đánh giá');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xóa đánh giá');
        router.push('/auth/login');
        return;
      }

      // Kiểm tra xem review có tồn tại không
      const reviewExists = reviews.find(review => review.id === reviewId);
      if (!reviewExists) {
        toast.error('Không tìm thấy đánh giá này');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/products/${id}/reviews/${reviewId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        toast.error('Không tìm thấy đánh giá này');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể xóa đánh giá');
      }

      toast.success('Đã xóa đánh giá thành công');
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể xóa đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square w-96 mx-auto overflow-hidden rounded-xl shadow-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />  
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(product.price)}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Mô tả sản phẩm</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin sản phẩm</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Danh mục</p>
                <p className="font-medium text-gray-900">{product.category_id}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-4">
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 text-lg font-medium text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg font-medium py-6 transition-colors"
            >
              Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-16 space-y-8">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá sản phẩm</h2>
          <ReviewForm 
            onSubmit={handleReviewSubmit} 
            hasReviewed={hasReviewed}
          />
        </div>
        
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tất cả đánh giá ({reviews.length})
          </h2>
          <ReviewList 
            reviews={reviews} 
            loading={reviewsLoading}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </div>
      </div>
    </div>
  );
}