"use client";

import { useState, useEffect } from "react";
import Chat from "@/components/chat";
import { auth } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

interface ChatRoom {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  room_id: string;
  created_at: string;
  last_message_time?: string;
}

export default function AdminChatDashboard() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});

  const fetchLastMessages = async (rooms: ChatRoom[]) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8000/api/chat/create-chat/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Không thể tạo kết nối chat");
      }

      const data = await res.json();
      
      if (auth) {
        await signInWithCustomToken(auth, data.firebase_token);
        
        const lastMessageTimes: Record<string, string> = {};
        
        rooms.forEach(room => {
          const messagesRef = ref(database, `chat_rooms/${room.room_id}/messages`);
          onValue(messagesRef, (snapshot) => {
            const messages = snapshot.val();
            if (messages) {
              const messageIds = Object.keys(messages);
              if (messageIds.length > 0) {
                const lastMessageId = messageIds[messageIds.length - 1];
                const lastMessage = messages[lastMessageId];
                lastMessageTimes[room.room_id] = lastMessage.timestamp;
                
                setLastMessages(prev => ({
                  ...prev,
                  [room.room_id]: lastMessage.timestamp
                }));
              }
            }
          });
        });
      }
    } catch (err) {
      console.error("Error fetching last messages:", err);
    }
  };

  useEffect(() => {
    const fetchChatRooms = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Vui lòng đăng nhập để truy cập trang này");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/chat/chat-rooms/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 403) {
          setError("Bạn không có quyền truy cập trang này");
          return;
        }

        if (!res.ok) {
          throw new Error(`Không thể tải danh sách chat: ${res.status}`);
        }

        const data = await res.json();
        setChatRooms(data);
        
        fetchLastMessages(data);
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải danh sách chat");
      }
    };

    fetchChatRooms();
  }, []);

  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    const timeA = lastMessages[a.room_id] || a.created_at;
    const timeB = lastMessages[b.room_id] || b.created_at;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });

  const handleRoomSelect = async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý Chat</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
          <p className="font-medium">Lỗi</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Danh sách người dùng</h3>
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {sortedChatRooms.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">Không có người dùng nào</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sortedChatRooms.map((room) => (
                  <li
                    key={room.id}
                    onClick={() => handleRoomSelect(room.room_id)}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${
                      selectedRoom === room.room_id 
                        ? "bg-blue-50 border-l-4 border-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-800">{room.user.username}</div>
                    <div className="text-sm text-gray-600">{room.user.email}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {lastMessages[room.room_id] 
                        ? `Tin nhắn cuối: ${new Date(lastMessages[room.room_id]).toLocaleString()}`
                        : `Tạo: ${new Date(room.created_at).toLocaleString()}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600">Đang kết nối...</p>
              </div>
            </div>
          ) : selectedRoom ? (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <Chat roomId={selectedRoom} userId="admin" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-white shadow-sm">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">Chọn một người dùng để bắt đầu chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}