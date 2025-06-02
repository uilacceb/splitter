import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AllClear from "../components/AllClear";
import TransactionInfo from "../components/TransactionInfo";
import AddFriend from "../components/AddFriend";
import FriendsList from "../components/FriendsList";

type Friend = {
  _id: string;
  name: string;
  picture: string;
};

type Transaction = {
  name: string;
  amount: number;
  type: "owe" | "expect";
  picture?: string;
};

const FriendsPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const txRes = await axios.get(
        `/api/users/friends/summary?userId=${currentUser._id}`
      );
      const txs = txRes.data;
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load transactions", error);
    }
  }, [currentUser._id]);

  useEffect(() => {
    const fetchFriendsAndTransactions = async () => {
      try {
        const res = await axios.get(
          `/api/users/friends?userId=${currentUser._id}`
        );
        setFriends(res.data);
        await fetchTransactions();
      } catch (error) {
        console.error("Failed to load friends or transactions", error);
      }
    };

    fetchFriendsAndTransactions();
  }, [currentUser._id, fetchTransactions]);

  // Listen for "settlementsChanged" custom event to refresh instantly
  useEffect(() => {
    const handler = () => fetchTransactions();
    window.addEventListener("settlementsChanged", handler);
    return () => window.removeEventListener("settlementsChanged", handler);
  }, [fetchTransactions]);

  // Optionally, still refresh on tab focus
  useEffect(() => {
    window.addEventListener("focus", fetchTransactions);
    return () => window.removeEventListener("focus", fetchTransactions);
  }, [fetchTransactions]);

  return (
    <>
      {transactions.length > 0 ? (
        <TransactionInfo transactions={transactions} />
      ) : (
        <AllClear />
      )}
      <AddFriend />
      <FriendsList />
    </>
  );
};

export default FriendsPage;
