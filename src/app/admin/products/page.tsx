"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch("http://localhost:8000/api/products/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách sản phẩm");
      return res.json();
    },
    enabled: !!token,
  });

  // Thêm sản phẩm
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch("http://localhost:8000/api/products/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Thêm sản phẩm thất bại");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "", price: "", image_url: "", category_id: "" });
    },
  });

  // Sửa sản phẩm
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Cập nhật sản phẩm thất bại");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ name: "", description: "", price: "", image_url: "", category_id: "" });
    },
  });

  // Xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Xóa sản phẩm thất bại");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && currentProduct) {
      updateMutation.mutate({ id: currentProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product: any) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      category_id: product.category?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!token) return <p>Vui lòng đăng nhập để truy cập trang này.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        onClick={() => {
          setIsEditMode(false);
          setFormData({ name: "", description: "", price: "", image_url: "", category_id: "" });
          setIsModalOpen(true);
        }}
      >
        Thêm sản phẩm
      </button>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th className="p-2">Tên</th>
            <th className="p-2">Giá</th>
            <th className="p-2">Danh mục</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product: any) => (
            <tr key={product.id}>
              <td className="p-2">{product.id}</td>
              <td className="p-2">{product.name}</td>
              <td className="p-2">{product.price}</td>
              <td className="p-2">{product.category?.name || "N/A"}</td>
              <td className="p-2">
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => handleEdit(product)}
                >
                  Thay đổi
                </button>
                <button
                  className="text-red-500"
                  onClick={() => handleDelete(product.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giá</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL hình ảnh</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Danh mục (category_id)</label>
                <input
                  type="number"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {isEditMode ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-red-500 mt-2">
                {createMutation.error?.message || updateMutation.error?.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}