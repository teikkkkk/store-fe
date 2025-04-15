"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/categories/');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Đang tải...</div>;
  }

  return (
    <nav className="w-full bg-black transition-all duration-300 py-3">
      <ul className="flex justify-center space-x-6 text-white font-medium">
        {categories.map((category) => (
          <li key={category.id}>
            <Link 
              href={`/products?category=${category.id}`}
              className="hover:text-blue-400 transition-colors"
            >
              {category.name.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 