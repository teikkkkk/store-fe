"use client";

import { useState, useEffect } from "react";
import Chat from "@/components/chat";
import { auth } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";

interface ChatRoom {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  room_id: string;
  created_at: string;
}

export default function AdminChatDashboard() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/chat/chat-rooms/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Không thể tải danh sách chat");
        }

        const data = await res.json();
        setChatRooms(data);
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        setError("Đã xảy ra lỗi khi tải danh sách chat");
      }
    };

    fetchChatRooms();
  }, []);

  const handleRoomSelect = async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Lấy token Firebase cho admin
      const res = await fetch("http://localhost:8000/api/chat/create-chat/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Không thể tạo kết nối chat");
      }

      const data = await res.json();
      
      // Đăng nhập Firebase với token
      if (auth) {
        await signInWithCustomToken(auth, data.firebase_token);
        setSelectedRoom(roomId);
      }
    } catch (err) {
      console.error("Error selecting room:", err);
      setError("Không thể kết nối với phòng chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Chat</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-2">Danh sách người dùng</h3>
          <div className="border rounded-lg overflow-hidden">
            {chatRooms.length === 0 ? (
              <p className="p-4 text-gray-500">Không có người dùng nào</p>
            ) : (
              <ul className="divide-y">
                {chatRooms.map((room) => (
                  <li
                    key={room.id}
                    onClick={() => handleRoomSelect(room.room_id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedRoom === room.room_id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-medium">{room.user.username}</div>
                    <div className="text-sm text-gray-500">{room.user.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Tạo: {new Date(room.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p>Đang kết nối...</p>
            </div>
          ) : selectedRoom ? (
            <div className="border rounded-lg p-4">
              <Chat roomId={selectedRoom} userId="admin" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg">
              <p className="text-gray-500">Chọn một người dùng để bắt đầu chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}