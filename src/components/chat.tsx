"use client";

import { useState, useEffect ,useRef} from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set } from "firebase/database";
import { auth } from "@/lib/firebase";

interface Message {
  sender: string;
  senderName?: string;
  content: string;
  timestamp: string;
}

interface ChatProps {
  roomId: string;
  userId: string;
  userName?: string;
  otherUserName?: string;
}

export default function Chat({ roomId, userId, otherUserName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current && messagesEndRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError("Bạn cần đăng nhập để sử dụng chat");
        return;
      }
      setError(null);
    });

    const messagesRef = ref(database, `chat_rooms/${roomId}/messages`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.values(data) as Message[];
        setMessages(messageList);
      }
    }, (error) => {
      console.error("Error fetching messages:", error);
      setError(`Lỗi khi tải tin nhắn: ${error.message}`);
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Bạn cần đăng nhập để gửi tin nhắn");
        return;
      }

      const messagesRef = ref(database, `chat_rooms/${roomId}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        sender: userId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      });
      
      setNewMessage("");
      setError(null);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(`Lỗi khi gửi tin nhắn: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-300px)]">
      <div className="flex items-center justify-between p-2 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {otherUserName || "Chat"}
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-2"
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-2 ${
                  msg.sender === userId 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-sm">{msg.content}</div>
                <div className={`text-xs mt-1 ${
                  msg.sender === userId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-2 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <button 
              onClick={sendMessage} 
              className="bg-blue-500 text-white px-4 py-1 rounded text-sm hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!auth.currentUser}
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}