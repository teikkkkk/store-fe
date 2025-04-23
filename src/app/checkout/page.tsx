'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    payment_method: 'cod',
    order_note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo đơn hàng');
      }

      const data = await response.json();
      toast.success('Đặt hàng thành công!');
      router.push('/account');

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Không thể tạo đơn hàng');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">Thanh toán</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-2xl border border-blue-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
          <Input
            required
            value={formData.full_name}
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Nhập họ tên của bạn"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
          <Input
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Email <span className="text-red-500">*</span></label>
          <Input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Nhập email của bạn"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
          <Input
            required
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Nhập địa chỉ giao hàng"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Thành phố <span className="text-red-500">*</span></label>
          <Input
            required
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Nhập thành phố"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Ghi chú</label>
          <textarea
            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px]"
            value={formData.order_note}
            onChange={(e) => setFormData({...formData, order_note: e.target.value})}
            placeholder="Nhập ghi chú đơn hàng (nếu có)"
          />
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
          >
            Đặt hàng
          </Button>
        </div>
      </form>
    </div>
  );
}