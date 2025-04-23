'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

interface Order {
    id: number;
    order_number: string;
    full_name: string;
    phone: string;
    email: string;
    address: string;
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        setToken(accessToken);
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchOrders();
    }, [token]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/orders/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách đơn hàng');
            }

            const data = await response.json();
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        }
    };

    const handleConfirmOrder = async (orderId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/confirm/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể xác nhận đơn hàng');
            }
    
            await fetchOrders(); 
            toast.success('Đã xác nhận đơn hàng thành công');
        } catch (error: any) {
            console.error('Error confirming order:', error);
            toast.error(error.message || 'Không thể xác nhận đơn hàng');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600';
            case 'confirmed':
                return 'text-blue-600';
            case 'shipping':
                return 'text-purple-600';
            case 'completed':
                return 'text-green-600';
            case 'cancelled':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const OrderTable = ({ orders }: { orders: Order[] }) => (
        <table className="w-full bg-white shadow-md rounded">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ĐH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">#{order.order_number}</td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{order.full_name}</div>
                            <div className="text-sm text-gray-500">{order.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.payment_method}</div>
                            <div className="text-sm text-gray-500">{order.payment_status}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {order.status === 'pending' && 'Chờ xác nhận'}
                                {order.status === 'confirmed' && 'Đã xác nhận'}
                                {order.status === 'shipping' && 'Đang giao hàng'}
                                {order.status === 'completed' && 'Đã giao hàng'}
                                {order.status === 'cancelled' && 'Đã hủy'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleConfirmOrder(order.id)}
                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                    Xác nhận
                                </button>
                            )}
                            {order.status === 'confirmed' && (
                                <button
                                    onClick={() => handleConfirmOrder(order.id)}
                                    className="text-purple-600 hover:text-purple-900 mr-2"
                                >
                                    Giao hàng
                                </button>
                            )}
                            {order.status === 'shipping' && (
                                <button
                                    onClick={() => handleConfirmOrder(order.id)}
                                    className="text-green-600 hover:text-green-900"
                                >
                                    Hoàn thành
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (loading) {
        return <div className="p-8 text-center">Đang tải...</div>;
    }

    const pendingOrders = orders.filter(order => order.status === 'pending');
    const confirmedOrders = orders.filter(order => order.status === 'confirmed');
    const allOrders = [...orders].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>
            
            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">
                        Chờ xác nhận ({pendingOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed">
                        Đã xác nhận ({confirmedOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                        Tất cả ({allOrders.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    {pendingOrders.length === 0 ? (
                        <p className="text-center py-4">Không có đơn hàng nào chờ xác nhận</p>
                    ) : (
                        <OrderTable orders={pendingOrders} />
                    )}
                </TabsContent>

                <TabsContent value="confirmed">
                    {confirmedOrders.length === 0 ? (
                        <p className="text-center py-4">Không có đơn hàng nào đã xác nhận</p>
                    ) : (
                        <OrderTable orders={confirmedOrders} />
                    )}
                </TabsContent>

                <TabsContent value="all">
                    <OrderTable orders={allOrders} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
