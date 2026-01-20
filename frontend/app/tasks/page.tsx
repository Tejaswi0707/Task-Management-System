"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
};

type TaskResponse = {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTasks(currentPage = page, currentStatus = status, currentSearch = search) {
    setLoading(true);
    setMessage(null);
    const res = await api.getTasks({
      page: currentPage,
      pageSize,
      status: currentStatus || undefined,
      search: currentSearch || undefined,
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || "Failed to load tasks");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as TaskResponse;
    setTasks(data.items);
    setPage(data.page);
    setTotal(data.total);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e: FormEvent) {
    e.preventDefault();
    loadTasks(1);
  }

  async function handleCreateOrUpdate(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!title.trim()) {
      setMessage("Title is required");
      return;
    }

    if (editingId) {
      const res = await api.updateTask(editingId, {
        title,
        description: description || undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || "Failed to update task");
      } else {
        setMessage("Task updated");
        setEditingId(null);
        setTitle("");
        setDescription("");
        loadTasks();
      }
    } else {
      const res = await api.createTask({ title, description: description || undefined });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || "Failed to create task");
      } else {
        setMessage("Task created");
        setTitle("");
        setDescription("");
        loadTasks();
      }
    }
  }

  async function handleDelete(id: number) {
    setMessage(null);
    const res = await api.deleteTask(id);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || "Failed to delete task");
    } else {
      setMessage("Task deleted");
      loadTasks();
    }
  }

  async function handleToggle(id: number) {
    setMessage(null);
    const res = await api.toggleTask(id);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || "Failed to toggle task");
    } else {
      setMessage("Task updated");
      loadTasks();
    }
  }

  async function handleLogout() {
    await api.logout();
    router.push("/login");
  }

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h1>Tasks</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </header>

        <section style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 8 }}>Filters</h2>
          <form
            onSubmit={handleFilterSubmit}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
          >
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 120, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor: "#222",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </form>
        </section>

        <section style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 8 }}>{editingId ? "Edit task" : "Add task"}</h2>
          <form
            onSubmit={handleCreateOrUpdate}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minHeight: 60 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                style={{
                  padding: "8px 12px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor: "#222",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setDescription("");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2 style={{ marginBottom: 8 }}>Task list</h2>
          {loading && <p>Loading...</p>}
          {!loading && tasks.length === 0 && <p>No tasks found.</p>}
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  backgroundColor: "#fff",
                  padding: 12,
                  borderRadius: 4,
                  border: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{task.title}</strong>{" "}
                    <span style={{ fontSize: 12, color: "#555" }}>({task.status.toLowerCase()})</span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => {
                        setEditingId(task.id);
                        setTitle(task.title);
                        setDescription(task.description || "");
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(task.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Toggle
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #e57373",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p style={{ fontSize: 14, color: "#444" }}>{task.description}</p>
                )}
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 14 }}>
              Page {page} of {totalPages} ({total} tasks)
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => {
                  const nextPage = page - 1;
                  setPage(nextPage);
                  loadTasks(nextPage);
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  cursor: page <= 1 ? "default" : "pointer",
                }}
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadTasks(nextPage);
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  cursor: page >= totalPages ? "default" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {message && (
          <div
            style={{
              marginTop: 12,
              padding: 8,
              borderRadius: 4,
              backgroundColor: "#e0f2f1",
              border: "1px solid #80cbc4",
              fontSize: 14,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}


