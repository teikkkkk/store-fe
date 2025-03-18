"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Providers from "./providers"; // Import Providers
import "./globals.css";

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    const handleStorageChange = () => {
      setLoggedIn(isLoggedIn());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
    router.push("/login");
  };

  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Providers> {/* Bọc toàn bộ ứng dụng trong Providers */}
          <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-2">
              <div className="flex justify-end items-center text-sm text-gray-600 mb-2">
                <Link href="/news" className="mx-2 hover:text-gray-800 transition-colors">
                  Tin tức
                </Link>
                <Link href="/stores" className="mx-2 hover:text-gray-800 transition-colors">
                  Cửa hàng
                </Link>
                <Link href="/contact" className="mx-2 hover:text-gray-800 transition-colors">
                  Liên hệ
                </Link>
              </div>

              <div className="flex justify-between items-center py-2">
                <Link href="/" className="flex items-center">
                  <Image src="/images/logo.webp" alt="NTKSHOP" width={50} height={50} />
                  <span className="ml-2 text-xl font-bold text-gray-800">NTKSHOP</span>
                </Link>

                <div className="flex-1 mx-8 max-w-xl">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full p-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Link href={loggedIn ? "/account" : "/login"}>
                    <svg
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
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
                      className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors"
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
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/auth/register"
                        className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <nav className="mt-2">
                <ul className="flex justify-center space-x-6 text-gray-800 font-medium">
                  <li>
                    <Link href="/men" className="hover:text-blue-600 transition-colors">
                      NAM
                    </Link>
                  </li>
                  <li>
                    <Link href="/women" className="hover:text-blue-600 transition-colors">
                      NỮ
                    </Link>
                  </li>
                  <li>
                    <Link href="/sports" className="hover:text-blue-600 transition-colors">
                      THỂ THAO
                    </Link>
                  </li>
                  <li>
                    <Link href="/teams" className="hover:text-blue-600 transition-colors">
                      ĐỒI TUYỀN
                    </Link>
                  </li>
                  <li>
                    <Link href="/brands" className="hover:text-blue-600 transition-colors">
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
        </Providers>
      </body>
    </html>
  );
}