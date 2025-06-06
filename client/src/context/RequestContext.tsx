import { createContext, useContext, useEffect, useState } from "react";

interface RequestCounts {
  friend: number;
  group: number;
  total: number;
}

interface RequestContextType {
  counts: RequestCounts;
  refreshCounts: () => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [counts, setCounts] = useState<RequestCounts>({
    friend: 0,
    group: 0,
    total: 0,
  });

  // Safe refreshCounts: Don't fetch if userId is missing
  const refreshCounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?._id;

      if (!userId) {
        // If not logged in, clear all counts (optional)
        setCounts({ friend: 0, group: 0, total: 0 });
        return;
      }

      const [friendRes, groupRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/friends/requests?userId=${userId}`).then((res) =>
          res.json()
        ),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/groups/requests?userId=${userId}`).then((res) =>
          res.json()
        ),
      ]);

      const friendCount = Array.isArray(friendRes) ? friendRes.length : 0;
      const groupCount = Array.isArray(groupRes) ? groupRes.length : 0;

      setCounts({
        friend: friendCount,
        group: groupCount,
        total: friendCount + groupCount,
      });

      localStorage.setItem("friendRequests", JSON.stringify(friendRes));
      localStorage.setItem("groupRequests", JSON.stringify(groupRes));
    } catch (error) {
      console.error("Failed to refresh request counts", error);
    }
  };

  // Only call refreshCounts if userId exists
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?._id) {
      refreshCounts();
    }
    // Don't run if no user._id
  }, []);

  // Listen for storage changes and refresh if userId exists
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "friendRequests" || e.key === "groupRequests") {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?._id) {
          refreshCounts();
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <RequestContext.Provider value={{ counts, refreshCounts }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequestCounts = () => {
  const ctx = useContext(RequestContext);
  if (!ctx)
    throw new Error("useRequestCounts must be used inside RequestProvider");
  return ctx;
};
