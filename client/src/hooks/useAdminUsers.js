import { useState, useEffect, useCallback } from "react";
import { getAllUsers } from "../api/userApi";

export default function useAdminUsers(role) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllUsers({ role, page, limit: 10, search });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [role, page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, search]);

  useEffect(() => {
    setPage(1);
  }, [role, search]);

  return {
    users,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch: fetchUsers,
  };
}
