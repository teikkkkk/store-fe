// app/admin/users/UsersPage.js
"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    is_active: true,
    is_staff: false,
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    setToken(accessToken || null);
    if (!accessToken) {
      router.push("/login");
    }
  }, [router]);

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch("http://localhost:8000/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
      return res.json();
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Thêm người dùng thất bại");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setFormData({ username: "", email: "", password: "", is_active: true, is_staff: false });
    },
    onError: (error) => {
      console.error("Create error:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch(`http://localhost:8000/api/users/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Cập nhật người dùng thất bại");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ username: "", email: "", password: "", is_active: true, is_staff: false });
      setCurrentUser(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!token) throw new Error("Không có token xác thực");
      const res = await fetch(`http://localhost:8000/api/users/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Xóa người dùng thất bại");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasPassword = formData.password && formData.password.trim() !== "";
    const dataToSend = hasPassword
      ? { ...formData }
      : {
          username: formData.username,
          email: formData.email,
          is_active: formData.is_active,
          is_staff: formData.is_staff,
        };

    if (!isEditMode) {
      if (!hasPassword) {
        alert("Vui lòng nhập mật khẩu khi tạo người dùng mới!");
        return;
      }
    }

    if (isEditMode && currentUser) {
      updateMutation.mutate({ id: currentUser.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend as any);
    }
  };

  const handleEdit = (user: any) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      is_active: user.is_active,
      is_staff: user.is_staff,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number | string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      deleteMutation.mutate(id as any);
    }
  };

  if (usersLoading) return <p>Loading...</p>;
  if (usersError) return <p className="text-red-500">Lỗi: {usersError.message}</p>;
  if (!token) return <p>Vui lòng đăng nhập để truy cập trang này.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Quản lý người dùng</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
        onClick={() => {
          setIsEditMode(false);
          setFormData({ username: "", email: "", password: "", is_active: true, is_staff: false });
          setCurrentUser(null);
          setIsModalOpen(true);
        }}
      >
        Thêm người dùng
      </button>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-center">STT</th>
            <th className="p-2 text-center">ID</th>
            <th className="p-2 text-center">Tên người dùng</th>
            <th className="p-2 text-center">Email</th>
            <th className="p-2 text-center">Trạng thái</th>
            <th className="p-2 text-center">Quyền Admin</th>
            <th className="p-2 text-center">Ngày tham gia</th>
            <th className="p-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user: any, index: number) => (
            <tr key={user.id}>
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2 text-center">{user.id}</td>
              <td className="p-2 text-center">{user.username}</td>
              <td className="p-2 text-center">{user.email || "N/A"}</td>
              <td className="p-2 text-center">{user.is_active ? "Hoạt động" : "Không hoạt động"}</td>
              <td className="p-2 text-center">{user.is_staff ? "Có" : "Không"}</td>
              <td className="p-2 text-center">{new Date(user.date_joined).toLocaleDateString()}</td>
              <td className="p-2 text-center">
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => handleEdit(user)}
                >
                  Thay đổi
                </button>
                <button
                  className="text-red-500"
                  onClick={() => handleDelete(user.id)}
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
              {isEditMode ? "Sửa người dùng" : "Thêm người dùng"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu {isEditMode ? "(để trống nếu không đổi)" : ""}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border rounded"
                  required={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={formData.is_active ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                  className="w-full p-2 border rounded"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quyền Admin</label>
                <select
                  value={formData.is_staff ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, is_staff: e.target.value === "true" })}
                  className="w-full p-2 border rounded"
                >
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setFormData({ username: "", email: "", password: "", is_active: true, is_staff: false });
                    setCurrentUser(null);
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