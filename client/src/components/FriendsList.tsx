import React from "react";

const FriendsList = () => {
  type Friend = {
    id: number;
    name: string;
  };
  const friends: Friend[] = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Alice Johnson" },
    { id: 4, name: "Bob Brown" },
    { id: 5, name: "Charlie Davis" },
    { id: 6, name: "Diana Prince" },
    { id: 7, name: "Ethan Hunt" },
    { id: 8, name: "Fiona Apple" },
    { id: 9, name: "George Clooney" },
    { id: 10, name: "Hannah Montana" },
    { id: 11, name: "Ian Somerhalder" },
    { id: 12, name: "Jack Sparrow" },
    { id: 13, name: "Katy Perry" },
    { id: 14, name: "Liam Neeson" },
    { id: 15, name: "Mia Farrow" },
    { id: 16, name: "Noah Centineo" },
    { id: 17, name: "Olivia Wilde" },
    { id: 18, name: "Paul Rudd" },
    { id: 19, name: "Quentin Tarantino" },
    { id: 20, name: "Rihanna Fenty" },
  ];
  return (
    <div className="pl-10">
      <h2>Friends ({friends.length})</h2>
      <div className="mt-2 space-y-1">
        {friends.map((friend) => (
          <div key={friend.id} className="text-sm text-gray-700">
            {friend.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
