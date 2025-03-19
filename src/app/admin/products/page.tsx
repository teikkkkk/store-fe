// app/admin/products/ProductsPage.js
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
    image: null as File | null, 
    category_id: "",
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  }, []);

  // Lấy danh sách sản phẩm
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
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

  // Lấy danh sách category
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
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

  // Thêm sản phẩm
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!token) throw new Error("Không có token xác thực");
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      formDataToSend.append("price", data.price);
      formDataToSend.append("category_id", data.category_id);
      if (data.image) {
        formDataToSend.append("image", data.image);
      }

      const res = await fetch("http://localhost:8000/api/products/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Thêm sản phẩm thất bại");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "", price: "", image: null, category_id: "" });
    },
    onError: (error) => {
      console.error("Create error:", error);
    },
  });

  // Sửa sản phẩm
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (!token) throw new Error("Không có token xác thực");
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      formDataToSend.append("price", data.price);
      formDataToSend.append("category_id", data.category_id);
      if (data.image) {
        formDataToSend.append("image", data.image);
      }

      const res = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Cập nhật sản phẩm thất bại");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ name: "", description: "", price: "", image: null, category_id: "" });
      setCurrentProduct(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
    },
  });

  // Xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
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
    onError: (error) => {
      console.error("Delete error:", error);
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
      image: null, 
      category_id: product.category?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number | string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteMutation.mutate(id);
    }
  };

  if (productsLoading || categoriesLoading) return <p>Loading...</p>;
  if (productsError) return <p className="text-red-500">Lỗi: {productsError.message}</p>;
  if (categoriesError) return <p className="text-red-500">Lỗi: {categoriesError.message}</p>;
  if (!token) return <p>Vui lòng đăng nhập để truy cập trang này.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        onClick={() => {
          setIsEditMode(false);
          setFormData({ name: "", description: "", price: "", image: null, category_id: "" });
          setCurrentProduct(null);
          setIsModalOpen(true);
        }}
      >
        Thêm sản phẩm
      </button>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-center">STT</th>
            <th className="p-2 text-center">ID</th>
            <th className="p-2 text-center">Tên</th>
            <th className="p-2 text-center">Giá</th>
            <th className="p-2 text-center">Hình ảnh</th>
            <th className="p-2 text-center">Danh mục</th>
            <th className="p-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product: any, index: number) => (
            <tr key={product.id}>
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2 text-center">{product.id}</td>
              <td className="p-2 text-center">{product.name}</td>
              <td className="p-2 text-center">{product.price}</td>
              <td className="p-2 text-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mx-auto" />
                ) : (
                  "N/A"
                )}
              </td>
              <td className="p-2 text-center">{product.category?.name || "N/A"}</td>
              <td className="p-2 text-center">
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
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center mt-30">
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
                <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] as File | null })}
                  className="w-20 h-20 p-2 border rounded"
                />  
                {isEditMode && currentProduct?.image && !formData.image && (
                  <p className="mt-2">
                    Hình ảnh hiện tại: <a href={currentProduct.image} target="_blank" className="text-blue-500">{currentProduct.image}</a>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setFormData({ name: "", description: "", price: "", image: null, category_id: "" });
                    setCurrentProduct(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={createMutation.isPending || updateMutation.isPending}
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