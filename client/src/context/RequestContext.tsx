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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "friendRequests" || e.key === "groupRequests") {
        refreshCounts();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const refreshCounts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const [friendRes, groupRes] = await Promise.all([
        fetch(`/api/users/friends/requests?userId=${user._id}`).then((res) =>
          res.json()
        ),
        fetch(`/api/groups/requests?userId=${user._id}`).then((res) =>
          res.json()
        ),
      ]);

      const friendCount = friendRes.length;
      const groupCount = groupRes.length;

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

  useEffect(() => {
    refreshCounts();
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
