"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Providers from "./providers";  
import "./globals.css";
import ChatButton from "@/components/ChatButton";

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); 
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

                <div
                  className={`flex-1 mx-8 transition-all duration-300 ${
                    isScrolled ? "max-w-md" : "max-w-xl"
                  }`} 
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className={`w-full p-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      isScrolled ? "p-1 text-xs" : "p-2"
                    }`} 
                  />
                </div>

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
              <nav
                className={`w-full bg-black transition-all duration-300 ${
                  isScrolled ? "py-2" : "py-3"
                }`}
              >
                <ul
                  className={`flex justify-center space-x-6 text-white font-medium transition-all duration-300 ${
                    isScrolled ? "text-sm" : "text-base"
                  }`}
                >
                  <li>
                    <Link href="/men" className="hover:text-blue-400 transition-colors">
                      NAM
                    </Link>
                  </li>
                  <li>
                    <Link href="/women" className="hover:text-blue-400 transition-colors">
                      NỮ
                    </Link>
                  </li>
                  <li>
                    <Link href="/sports" className="hover:text-blue-400 transition-colors">
                      THỂ THAO
                    </Link>
                  </li>
                  <li>
                    <Link href="/teams" className="hover:text-blue-400 transition-colors">
                      ĐỘI TUYỂN
                    </Link>
                  </li>
                  <li>
                    <Link href="/brands" className="hover:text-blue-400 transition-colors">
                      CÁC NHÃN HIỆU
                    </Link>
                  </li>
                  <li>
                    <Link href="/sale" className="text-red-500 hover:text-red-700 transition-colors">
                      SALE SỐC
                    </Link>
                  </li>
                </ul>
              </nav>
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
      </body>
    </html>
  );
}