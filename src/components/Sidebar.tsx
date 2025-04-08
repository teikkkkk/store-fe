import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/admin/dashboard" className="block p-2 hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className="block p-2 hover:bg-gray-700">
              Products
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="block p-2 hover:bg-gray-700">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className="block p-2 hover:bg-gray-700">
              Orders
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="block p-2 hover:bg-gray-700">
              Users
            </Link>
            <Link href="/admin/chat" className=" block p-2 hover:bg-gray-700" >
            Chat
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}