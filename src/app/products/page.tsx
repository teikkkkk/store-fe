"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface Category {
  id: number;
  name: string;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  sort: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category');
  const searchTerm = searchParams.get('search');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchProducts = async (params: URLSearchParams) => {
    try {
      setLoading(true);
      const productsRes = await fetch(`http://localhost:8000/api/products/?${params.toString()}`);
      const productsData = await productsRes.json();
      setProducts(productsData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (categoryId) params.append('category', categoryId);
    if (searchTerm) params.append('search', searchTerm);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.sort) params.append('sort', filters.sort);

    router.push(`/products?${params.toString()}`);
    fetchProducts(params);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (categoryId) {
          const categoryRes = await fetch(`http://localhost:8000/api/categories/${categoryId}/`);
          const categoryData = await categoryRes.json();
          setCategory(categoryData);
        }
        const params = new URLSearchParams();
        if (categoryId) params.append('category', categoryId);
        if (searchTerm) params.append('search', searchTerm);
        const urlMinPrice = searchParams.get('min_price');
        const urlMaxPrice = searchParams.get('max_price');
        const urlSort = searchParams.get('sort');
        
        if (urlMinPrice) params.append('min_price', urlMinPrice);
        if (urlMaxPrice) params.append('max_price', urlMaxPrice);
        if (urlSort) params.append('sort', urlSort);

        await fetchProducts(params);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };

    fetchData();
  }, [categoryId, searchTerm]); 
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Đang tải sản phẩm...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {category && (
        <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      )}
      
      {searchTerm && (
        <h2 className="text-2xl font-semibold mb-6">
          Kết quả tìm kiếm cho "{searchTerm}"
        </h2>
      )}

      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Giá tối thiểu
            </label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="VNĐ"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Giá tối đa
            </label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="VNĐ"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sắp xếp theo
            </label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <div 
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={product.image || '/images/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                <p className="text-red-600 font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          {searchTerm ? (
            <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchTerm}"</p>
          ) : (
            <p className="text-gray-500">Không có sản phẩm nào phù hợp với bộ lọc</p>
          )}
        </div>
      )}
    </div>
  );
} 