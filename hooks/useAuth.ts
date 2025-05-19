// app/hooks/useAuth.ts

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";

export function useAuth(protectedRoute = true, adminOnly = false) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token && protectedRoute) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwt.decode(token);
      if (adminOnly && decoded?.role !== "admin") {
        router.push("/not-authorized");
      }
    } catch (err) {
      localStorage.removeItem("jwt");
      router.push("/login");
    }
  }, []);
}
