'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    order_note:''
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/cart/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải giỏ hàng');
      }

      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    const currentItem = cartItems.find(item => item.id === itemId);
    if (!currentItem) return;
    if (newQuantity < 1) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/cart/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: currentItem.product.id,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật số lượng');
      }

      await fetchCartItems();
      toast.success('Đã cập nhật số lượng');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity)) return;
    updateQuantity(itemId, newQuantity);
  };

  const removeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/cart/items/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa sản phẩm');
      }

      await fetchCartItems();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );
  };

  const handleVNPayPayment = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      if (cartItems.length === 0) {
        toast.error('Giỏ hàng trống');
        return;
      }
      if (!paymentInfo.full_name || !paymentInfo.phone || !paymentInfo.email || !paymentInfo.address || !paymentInfo.city) {
        toast.error('Vui lòng điền đầy đủ thông tin thanh toán');
        return;
      }

      const response = await fetch('http://localhost:8000/api/payment/create-vnpay-payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          ...paymentInfo
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Không thể tạo thanh toán');
      }

      const data = await response.json();
      window.location.href = data.payment_url;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.message || 'Không thể tạo thanh toán');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Giỏ hàng của bạn đang trống</p>
          <Button onClick={() => router.push('/')}>Tiếp tục mua sắm</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center border-b py-4">
                <div className="relative w-24 h-24">
                  <Image 
                    src={`http://localhost:8000${item.product.image}`}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 96px) 100vw, 96px"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.product.price)}
                  </p>
                  <div className="flex items-center mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <Input 
                      type="number"
                      min="1"
                      value={item.quantity} 
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16 mx-2 text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Tổng đơn hàng</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal())}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal())}
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Button className="w-full" onClick={() => router.push('/checkout')}>
                  Thanh toán khi nhận hàng
                </Button>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowPaymentForm(true)}
                >
                  Thanh toán qua VNPay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl w-full max-w-lg shadow-2xl border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Thông tin thanh toán</h2>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="text-blue-500 hover:text-blue-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                <Input
                  value={paymentInfo.full_name}
                  onChange={(e) => setPaymentInfo({...paymentInfo, full_name: e.target.value})}
                  placeholder="Nhập họ tên của bạn"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <Input
                  value={paymentInfo.phone}
                  onChange={(e) => setPaymentInfo({...paymentInfo, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Email <span className="text-red-500">*</span></label>
                <Input
                  type="email"
                  value={paymentInfo.email}
                  onChange={(e) => setPaymentInfo({...paymentInfo, email: e.target.value})}
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                <Input
                  value={paymentInfo.address}
                  onChange={(e) => setPaymentInfo({...paymentInfo, address: e.target.value})}
                  placeholder="Nhập địa chỉ giao hàng"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Thành phố <span className="text-red-500">*</span></label>
                <Input
                  value={paymentInfo.city}
                  onChange={(e) => setPaymentInfo({...paymentInfo, city: e.target.value})}
                  placeholder="Nhập thành phố"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">Ghi chú</label>
          <textarea
            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-h-[100px]"
            value={paymentInfo.order_note}
            onChange={(e) => setPaymentInfo({...paymentInfo, order_note: e.target.value})}
            placeholder="Nhập ghi chú đơn hàng (nếu có)"
          />
        </div>
              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-700">Tổng tiền thanh toán:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(calculateTotal())}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    className="flex-1 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Hủy
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleVNPayPayment}
                  >
                    Tiến hành thanh toán
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
