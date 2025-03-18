"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
};

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoggedIn(isLoggedIn());

    const handleStorageChange = () => setLoggedIn(isLoggedIn());

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setLoggedIn(false);
    router.push("/");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-end items-center mb-2">
          <Link href="/news" className="text-sm text-gray-600 mx-2">
            Tin tức
          </Link>
          <Link href="/stores" className="text-sm text-gray-600 mx-2">
            Cửa hàng
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 mx-2">
            Liên hệ
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.webp" alt="NTKSHOP" width={50} height={50} />
            <span className="ml-2 text-xl font-bold text-gray-800">NTKSHOP</span>
          </Link>
          <div className="flex-1 mx-8">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full p-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link href={loggedIn ? "/account" : "/login"}>
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link href="/cart">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            {loggedIn ? (
              <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                Đăng xuất
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/auth/register" className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
        <nav className="mt-2">
          <ul className="flex justify-center space-x-6 text-gray-800 font-medium">
            <li><Link href="/men">NAM</Link></li>
            <li><Link href="/women">NỮ</Link></li>
            <li><Link href="/sports">THỂ THAO</Link></li>
            <li><Link href="/teams">ĐỘI TUYỂN</Link></li>
            <li><Link href="/brands">CÁC NHÃN HIỆU</Link></li>
            <li><Link href="/sale" className="text-red-500">SALE SỐC</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
