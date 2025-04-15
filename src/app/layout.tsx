"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Providers from "./providers";  
import "./globals.css";
import ChatButton from "@/components/ChatButton";
import { Toaster } from 'react-hot-toast';
import CategoryNav from "@/components/CategoryNav";

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    const handleStorageChange = () => {
      setLoggedIn(isLoggedIn());
    };

    window.addEventListener("storage", handleStorageChange);
    const handleScroll = () => {
      if (window.scrollY ) { 
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen bg-black">
        <Providers>
          <header
            className={`bg-white shadow-md sticky top-0 z-10 transition-all duration-300 ${
              isScrolled ? "h-[105px]" : "h-[165px]"
            }`} 
          >
            <div>
              <div
                className={`flex justify-end items-center text-sm text-white bg-black transition-all duration-300 px-10 ${
                  isScrolled ? "h-[25px] text-xs" : "h-[35px]"
                }`} 
              >
                <Link href="/news" className="mx-2 hover:text-gray-300 transition-colors">
                  Tin tức
                </Link>
                <Link href="/stores" className="mx-2 hover:text-gray-300 transition-colors">
                  Cửa hàng
                </Link>
                <Link href="/contact" className="mx-2 hover:text-gray-300 transition-colors">
                  Liên hệ
                </Link>
              </div>
              <div
                className={`flex justify-between items-center px-10 transition-all duration-300 ${
                  isScrolled ? "py-1 h-[55px]" : "py-2 h-[100px]"
                }`} 
              >
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/logo.webp"
                    alt="NTKSHOP"
                    width={isScrolled ? 40 : 50} 
                    height={isScrolled ? 40 : 50}
                    className="transition-all duration-300"
                  />
                  <span
                    className={`ml-2 font-bold text-gray-800 transition-all duration-300 ${
                      isScrolled ? "text-lg" : "text-xl"
                    }`}
                  >
                    NTKSHOP
                  </span>
                </Link>

                <form
                  onSubmit={handleSearch}
                  className={`flex-1 mx-8 transition-all duration-300 ${
                    isScrolled ? "max-w-md" : "max-w-xl"
                  }`} 
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className={`w-full p-2 pr-10 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                        isScrolled ? "p-1 text-xs" : "p-2"
                      }`} 
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <svg
                        className={`text-gray-400 hover:text-gray-600 transition-colors ${
                          isScrolled ? "w-4 h-4" : "w-5 h-5"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>

                <div className="flex items-center space-x-4">
                  <Link href={loggedIn ? "/account" : "/login"}>
                    <svg
                      className={`text-gray-600 hover:text-gray-800 transition-all duration-300 ${
                        isScrolled ? "w-5 h-5" : "w-6 h-6"
                      }`} 
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </Link>
                  <Link href="/cart">
                    <svg
                      className={`text-gray-600 hover:text-gray-800 transition-all duration-300 ${
                        isScrolled ? "w-5 h-5" : "w-6 h-6"
                      }`} 
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </Link>
                  {loggedIn ? (
                    <button
                      onClick={handleLogout}
                      className={`font-medium text-gray-600 hover:text-gray-800 transition-all duration-300 ${
                        isScrolled ? "text-xs" : "text-sm"
                      }`} 
                    >
                      Đăng xuất
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className={`font-medium text-gray-600 hover:text-gray-800 transition-all duration-300 ${
                          isScrolled ? "text-xs" : "text-sm"
                        }`} 
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/auth/register"
                        className={`font-medium text-gray-600 hover:text-gray-800 transition-all duration-300 ${
                          isScrolled ? "text-xs" : "text-sm"
                        }`} 
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <CategoryNav />
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>© 2025 NTKSHOP. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
            </div>
          </footer>
          <ChatButton />
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}