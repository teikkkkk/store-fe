// app/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/categories/");
      if (!res.ok) throw new Error("Không thể tải danh sách danh mục");
      return res.json();
    },
  });

  const { data: topProducts, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/products/top-selling/");
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm nổi bật");
      return res.json();
    },
  });
  const { data: products }= useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/products/");
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm ");
      return res.json();
    },
  });

  if (categoriesLoading || productsLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (categoriesError) return <p className="text-center text-red-500">Lỗi: {categoriesError.message}</p>;
  if (productsError) return <p className="text-center text-red-500">Lỗi: {productsError.message}</p>;

  return (
    <div className="container mx-auto max-w-screen-xl px-10 py-10">
      {/* Phần Bộ Sưu Tập */}
      <section className="mb-10 ">
        <h2 className="text-2xl font-bold text-center mb-4">BỘ SƯU TẬP</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories?.slice(0, 4).map((category: any) => (
              <div 
                key={category.id} 
                className="relative cursor-pointer group overflow-hidden rounded-lg"
              >
                <Image
                  src={(category.image || "/images/a.jpg").trimStart()}  
                  alt={category.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">{category.name.toUpperCase()}</h3>
                </div>
              </div>
          ))}
        </div>
      </section>
      <section>
        <div className="relative mb-4">
          <h2 className="text-2xl font-bold text-center">TOP 10 SẢN PHẨM BÁN CHẠY NHẤT</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topProducts?.map((product: any) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="relative bg-white shadow rounded-lg p-4 cursor-pointer group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={(product.image || "/placeholder.jpg").trimStart()}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-sm font-bold rounded-full px-2 py-1">
                  -{product.discount || 33}%
                </div>
                <h3 className="text-center mt-2 font-semibold">{product.name}</h3>
                <div className="text-center justify-between mt-2">
                  <span className="text-gray-500">{product.price}đ</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="relative mb-4 mt-10">
          <h2 className="text-2xl font-bold text-center">CÁC SẢN PHẨM NỔI BẬT</h2>
          <Link 
            href="/products" 
            className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center text-sm"
          >
            Xem tất cả
            <svg 
              className="w-4 h-4 ml-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {products?.map((product: any) => (
            <Link key={product.id} href={`/product/${product.id}`}>
             <div className="relative bg-white shadow rounded-lg p-4 cursor-pointer group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={(product.image || "/placeholder.jpg").trimStart()}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-sm font-bold rounded-full px-2 py-1">
                  -{product.discount || 33}%
                </div>
                <h3 className="text-center mt-2 font-semibold">{product.name}</h3>
                <div className="text-center justify-between mt-2 ">
                  <span className="text-gray-500 ">{product.price}đ</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>  
    </div>
  );
}