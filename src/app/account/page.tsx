"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);
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
           
        fetchUserInfo();
    }, [token]);

    if (!token) return <p className="text-center text-gray-500">Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Thông tin tài khoản</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {userInfo ? (
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
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
            </div>
        </div>
    );
}