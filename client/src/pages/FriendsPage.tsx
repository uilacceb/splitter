import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchFriendsAndTransactions = async () => {
      try {
        const res = await axios.get(
          `/api/users/friends?userId=${currentUser._id}`
        );
        setFriends(res.data);

        const txRes = await axios.get(
          `/api/users/friends/summary?userId=${currentUser._id}`
        );
        const txs = txRes.data; // expected format: [{ name, amount, type, picture }]
        setTransactions(txs);
      } catch (error) {
        console.error("Failed to load friends or transactions", error);
      }
    };

    fetchFriendsAndTransactions();
  }, [currentUser._id]);

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
