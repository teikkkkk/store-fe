"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaComments } from "react-icons/fa";

export default function ChatButton() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <Link href="/chat">
      <div className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-all duration-300 z-50 flex items-center justify-center cursor-pointer">
        <FaComments size={24} />
        <span className="ml-2 font-medium">Chat</span>
      </div>
    </Link>
  );
} 