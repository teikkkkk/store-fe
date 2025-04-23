'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PaymentStatus {
  status: 'success' | 'error' | 'loading';
  message: string;
}

export default function VNPayReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Đang xử lý thanh toán...'
  });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentData = {
          vnp_Amount: searchParams.get('vnp_Amount'),
          vnp_BankCode: searchParams.get('vnp_BankCode'),
          vnp_BankTranNo: searchParams.get('vnp_BankTranNo'),
          vnp_CardType: searchParams.get('vnp_CardType'),
          vnp_OrderInfo: searchParams.get('vnp_OrderInfo'),
          vnp_PayDate: searchParams.get('vnp_PayDate'),
          vnp_ResponseCode: searchParams.get('vnp_ResponseCode'),
          vnp_TmnCode: searchParams.get('vnp_TmnCode'),
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo'),
          vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus'),
          vnp_TxnRef: searchParams.get('vnp_TxnRef'),
          vnp_SecureHash: searchParams.get('vnp_SecureHash')
        };
        const requiredFields = ['vnp_ResponseCode', 'vnp_TransactionStatus', 'vnp_TxnRef'];
        const missingFields = requiredFields.filter(field => !paymentData[field as keyof typeof paymentData]);

        if (missingFields.length > 0) {
          throw new Error('Thiếu thông tin thanh toán');
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Vui lòng đăng nhập lại');
        }

        const queryString = new URLSearchParams(paymentData as Record<string, string>).toString();
        const response = await fetch(`http://localhost:8000/api/orders/payment/vnpay-return/?${queryString}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          setPaymentStatus({
            status: 'success',
            message: data.message || 'Thanh toán thành công'
          });
          toast.success(data.message || 'Thanh toán thành công');
          setTimeout(() => router.push('/account'), 2000);
        } else {
          throw new Error(data.message || 'Thanh toán không thành công');
        }

      } catch (error: any) {
        console.error('Payment verification error:', error);
        setPaymentStatus({
          status: 'error',
          message: error.message
        });
        toast.error(error.message);
        setTimeout(() => router.push('/cart'), 2000);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          {paymentStatus.status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <p className="text-gray-600">{paymentStatus.message}</p>
            </div>
          )}

          {paymentStatus.status === 'success' && (
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-semibold text-xl">{paymentStatus.message}</p>
              <p className="text-gray-500">Đang chuyển đến trang đơn hàng...</p>
            </div>
          )}

          {paymentStatus.status === 'error' && (
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold text-xl">{paymentStatus.message}</p>
              <p className="text-gray-500">Đang chuyển về giỏ hàng...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}