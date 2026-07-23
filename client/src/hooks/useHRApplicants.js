import { useState, useEffect, useCallback } from "react";
import { getHRApplicants } from "../api/hrVerificationApi";

export default function useHRApplicants(status) {
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getHRApplicants({ status, page, limit: 10, search });
      setApplicants(res.data.applicants);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError("Failed to fetch HR applicants.");
    } finally {
      setLoading(false);
    }
  }, [status, page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchApplicants, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchApplicants, search]);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  return {
    applicants,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch: fetchApplicants,
  };
}
