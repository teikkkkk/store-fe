'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

interface OrderDetail {
  id: number;
  order_number: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/orders/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải thông tin đơn hàng');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-8">Không tìm thấy đơn hàng</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{order.order_number}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Thông tin đơn hàng</h2>
            <p>Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
            <p>Trạng thái: {order.status}</p>
            <p>Phương thức thanh toán: {order.payment_method}</p>
            <p>Trạng thái thanh toán: {order.payment_status}</p>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Thông tin giao hàng</h2>
            <p>Họ tên: {order.full_name}</p>
            <p>Số điện thoại: {order.phone}</p>
            <p>Email: {order.email}</p>
            <p>Địa chỉ: {order.address}</p>
            <p>Thành phố: {order.city}</p>
          </div>
        </div>

        <div className="border rounded p-4">
          <h2 className="font-semibold mb-4">Sản phẩm</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}