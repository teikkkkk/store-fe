// app/chat/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, push, set } from "firebase/database";
import { signInWithCustomToken } from "firebase/auth";
import { FaPaperPlane, FaUser } from "react-icons/fa";
import { database, auth } from "@/lib/firebase";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        localStorage.removeItem("user");
        const userResponse = await fetch("http://localhost:8000/api/user-info/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to get user info");
        }

        const userData = await userResponse.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        let currentRoomId = null;
        const response = await fetch("http://localhost:8000/api/chat/get-room/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            const createResponse = await fetch("http://localhost:8000/api/chat/create-chat/", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!createResponse.ok) {
              throw new Error("Failed to create chat room");
            }

            const createData = await createResponse.json();
            currentRoomId = createData.room_id;
            setRoomId(currentRoomId);
            
            
            await signInWithCustomToken(auth, createData.firebase_token);
          } else {
            throw new Error("Failed to get chat room");
          }
        } else {
          const data = await response.json();
          if (data.room_id) {
            currentRoomId = data.room_id;
            setRoomId(currentRoomId);
            const firebaseResponse = await fetch("http://localhost:8000/api/chat/token/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!firebaseResponse.ok) {
              throw new Error("Failed to get Firebase token");
            }

            const { token: firebaseToken } = await firebaseResponse.json();
            await signInWithCustomToken(auth, firebaseToken);
          }
        }

        if (currentRoomId) {
          console.log("Setting up message listener for room:", currentRoomId);
          const messagesRef = ref(database, `chat_rooms/${currentRoomId}/messages`);
          onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Received messages data:", data);
            if (data) {
              const messageList = Object.entries(data).map(([id, msg]: [string, any]) => ({
                id,
                content: msg.content,
                sender: msg.sender,
                timestamp: msg.timestamp,
              }));
              setMessages(messageList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
            } else {
              setMessages([]);
            }
          });
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (roomId && auth.currentUser) {
      console.log("Setting up message listener for room:", roomId);
      const messagesRef = ref(database, `chat_rooms/${roomId}/messages`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        console.log("Received messages data:", data);
        if (data) {
          const messageList = Object.entries(data).map(([id, msg]: [string, any]) => ({
            id,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
          }));
          setMessages(messageList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        } else {
          setMessages([]);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [roomId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    try {
      if (!auth.currentUser) {
        setError("Bạn cần đăng nhập để gửi tin nhắn");
        return;
      }

      const messagesRef = ref(database, `chat_rooms/${roomId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        content: newMessage,
        sender: user?.username || "Anonymous",
        timestamp: new Date().toISOString(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full mx-auto ">
      <div className="h-full">
        <div className="h-full bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full shadow-md">
                <FaUser className="text-blue-500 text-xl" />
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">Chat với Admin</h2>
                <p className="text-blue-100 text-sm">Bạn: {user?.username}</p>
              </div>
            </div>
          </div>
          <div className="h-[350px] overflow-y-auto p-6 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.sender === user?.username ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    message.sender === user?.username
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4"
                      : "bg-white text-gray-800 mr-4 border border-gray-200"
                  }`}
                >
                  <div className="text-sm break-words">{message.content}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-full px-6 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-3 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <FaPaperPlane className="text-xl" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}