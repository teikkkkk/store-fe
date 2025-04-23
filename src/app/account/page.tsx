"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function AccountPage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState("");
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        setToken(accessToken);
        if (!accessToken) {
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        if (!token) return;

        const fetchUserInfo = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/user-info/", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || "Không thể lấy thông tin người dùng");
                }

                const data = await res.json();
                setUserInfo(data);
                setError("");
            } catch (err) {
                setError("Có lỗi xảy ra khi lấy thông tin người dùng");
                setUserInfo(null);
            }
        };

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
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Không thể tải danh sách đơn hàng');
            }
        };
           
        fetchUserInfo();
        fetchOrders();
    }, [token]);

    const handleCancelOrder = async (orderId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/cancel/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Không thể hủy đơn hàng');
            }
            const updatedOrders = orders.map(order => 
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            );
            setOrders(updatedOrders);
            toast.success('Đã hủy đơn hàng thành công');
        } catch (error: any) {
            console.error('Error canceling order:', error);
            toast.error(error.message || 'Không thể hủy đơn hàng');
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600';
            case 'completed':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };
    
    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Chờ thanh toán';
            case 'completed':
                return 'Đã thanh toán';
            case 'failed':
                return 'Thanh toán thất bại';
            default:
                return 'Không xác định';
        }
    };

    if (!token) return <p className="text-center text-gray-500">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tài khoản của tôi</h1>
                
                <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
                    <TabsList className="mb-6">
                        <TabsTrigger value="profile">Thông tin tài khoản</TabsTrigger>
                        <TabsTrigger value="orders">Đơn hàng của tôi</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                        {userInfo ? (
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Chi tiết tài khoản</h2>
                                <div className="space-y-3">
                                    <p className="text-gray-700">
                                        <strong className="font-medium">ID:</strong> {userInfo.id}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong className="font-medium">Tên người dùng:</strong> {userInfo.username}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong className="font-medium">Email:</strong> {userInfo.email}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong className="font-medium">Quyền quản trị:</strong>{" "}
                                        {userInfo.is_staff ? (
                                            <span className="text-green-600">Có</span>
                                        ) : (
                                            <span className="text-red-600">Không</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            !error && <p className="text-center text-gray-500">Đang tải thông tin...</p>
                        )}
                    </TabsContent>

                    <TabsContent value="orders">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Đơn hàng của tôi</h2>
                            
                            {orders.length === 0 ? (
                                <p className="text-center text-gray-500">Bạn chưa có đơn hàng nào</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border rounded p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold">
                                                    <span 
                                                        className="text-blue-600 cursor-pointer hover:underline"
                                                        onClick={() => router.push(`/account/orders/${order.id}`)}
                                                    >
                                                        Đơn hàng #{order.order_number}
                                                    </span>
                                                </h3>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <div>
                                                    <p className="text-sm text-gray-600">Tổng tiền:</p>
                                                    <p className="font-medium">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(order.total_amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Trạng thái:</p>
                                                    <p className={`font-medium ${getPaymentStatusColor(order.status)}`}>
                                                        {order.status === 'pending' && 'Chờ xác nhận'}
                                                        {order.status === 'confirmed' && 'Đã xác nhận'}
                                                        {order.status === 'shipping' && 'Đang giao hàng'}
                                                        {order.status === 'completed' && 'Đã giao hàng'}
                                                        {order.status === 'cancelled' && 'Đã hủy'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className=" text-sm text-gray-600"> Thanh Toán</p>
                                                    <p className={`font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                                        {getPaymentStatusText(order.payment_status)}
                                                    </p>
                                                </div>
                                            </div>

                                            {order.status === 'pending' || order.status === 'confirmed' ? (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="text-red-500 text-sm hover:underline mt-2"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}