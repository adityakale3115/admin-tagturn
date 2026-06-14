import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Search, Trash2, User } from "lucide-react";
import { toast } from "react-toastify";
import "../../styles/AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(
        collection(db, "users")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (user) => {
    if (
      !window.confirm(
        `Delete ${user.name || user.email}?`
      )
    )
      return;

    try {
      await deleteDoc(
        doc(db, "users", user.id)
      );

      setUsers((prev) =>
        prev.filter((u) => u.id !== user.id)
      );

      toast.success("User deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const filtered = users.filter((u) => {
    return (
      (u.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (u.email || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  return (
    <div className="admin-container">
      <AdminSidebar active="users" />

      <main className="admin-content">
        <div className="users-header">
          <h1>Users</h1>
          <span>{users.length} Users</span>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          <User size={18} />
                        </div>

                        <span>
                          {u.name || "No Name"}
                        </span>
                      </div>
                    </td>

                    <td>{u.email}</td>

                    <td>
                      {u.phone ||
                        u.mobile ||
                        "-"}
                    </td>

                    <td>{u.city || "-"}</td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteUser(u)
                        }
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}