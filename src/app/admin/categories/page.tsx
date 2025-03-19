'use client'
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  }, []);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch("http://localhost:8000/api/categories/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách danh mục");
      return res.json();
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch("http://localhost:8000/api/categories/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Thêm danh mục thất bại");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      setFormData({ name: "" });
    },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch(`http://localhost:8000/api/categories/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Cập nhật danh mục thất bại");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      setIsEditMode(false); 
      setFormData({ name: "" });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch(`http://localhost:8000/api/categories/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Xóa danh mục thất bại");
    },
    onSuccess: () => {  
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      updateMutation.mutate({ id: currentCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  const handleEdit = (category: any) => {
    setIsEditMode(true);
    setCurrentCategory(category);   
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      deleteMutation.mutate(id);
    }
  };
  if (isLoading) return <p>Loading...</p>;
  if (!token) return <p>Vui lòng đăng nhập để truy cập trang này.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý danh mục</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        onClick={() => {
          setIsEditMode(false);
          setFormData({ name: "" });
          setIsModalOpen(true);
        }}
      >
        Thêm danh mục
      </button>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">STT</th>
            <th className="p-2">ID</th>
            <th className="p-2">Tên</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((category: any, index: number) => (
            <tr key={category.id}>
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2 text-center">{category.id}</td>
              <td className="p-2 text-center">{category.name}</td>
              <td className="p-2 text-center">
              <button className="text-blue-500 mr-2" onClick={() => handleEdit(category)}>
                Sửa
                </button>
                <button className="text-red-500" onClick={() => handleDelete(category.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-1/2">
              <h3 className="text-xl font-bold mb-4">
                {isEditMode ? "Sửa danh mục" : "Thêm danh mục"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isEditMode ? "Cập nhật" : "Thêm"}
                </button>
              </form>
              {(createMutation.isError || updateMutation.isError) && (
                <p className="text-red-500 mt-2">
                  {createMutation.error?.message || updateMutation.error?.message}
                </p>
              )}
            </div>
          </div>
        )}
      </table>
    </div>
  );
}
