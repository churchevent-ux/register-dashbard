import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import UserTable from "../component/UserTable.jsx";

const TeensDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const teensUsers = users.filter(u => Number(u.age) >= 13 && Number(u.age) <= 18);
  const filteredTeens = teensUsers.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.participantName && u.participantName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.primaryContactNumber && u.primaryContactNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Teens (13-18 years)</h2>
      <input
        type="text"
        placeholder="Search by ID, name, email, or phone"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: 8, width: 260, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
      />
      <div style={{ overflowX: 'auto' }}>
        <UserTable users={filteredTeens} />
      </div>
    </div>
  );
};

export default TeensDashboard;
