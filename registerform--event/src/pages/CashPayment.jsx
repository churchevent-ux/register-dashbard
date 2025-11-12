import React, { useState, useEffect } from "react";
import AdminLoginForm from "./AdminLoginForm.jsx";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const CashPayment = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, paid, notpaid
  const [success, setSuccess] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [search, setSearch] = useState("");


  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, [success]);


  const handleMarkPaid = async (user) => {
    if (!user || !cashAmount) return;
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, {
      cashPaid: true,
      cashAmount: parseFloat(cashAmount),
      cashPaidAt: new Date().toISOString(),
    });
    setSuccess(`Marked ${user.name || user.email || user.id} as paid.`);
    setCashAmount("");
    setTimeout(() => setSuccess("") , 2000);
  };



  // Filter users by paid/not paid
  const filteredUsers = users.filter(u => {
    if (filter === 'paid') return u.cashPaid;
    if (filter === 'notpaid') return !u.cashPaid;
    return true;
  }).filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ width: '100%', background: "#fff", padding: 32, borderRadius: 18, boxShadow: "0 4px 24px #e5e5e5", fontFamily: 'inherit', margin: 0 }}>
      <h2 style={{ fontSize: 26, textAlign: 'center', marginBottom: 24, color: '#6c3483', letterSpacing: 0.5 }}>Cash Payment Tracking</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, justifyContent: 'center' }}>
        <button onClick={() => setFilter('all')} style={{ padding: '8px 22px', borderRadius: 8, border: filter === 'all' ? '2px solid #6c3483' : '1.5px solid #e5e7e9', background: filter === 'all' ? '#f8f8fa' : '#fff', color: '#6c3483', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>All</button>
        <button onClick={() => setFilter('paid')} style={{ padding: '8px 22px', borderRadius: 8, border: filter === 'paid' ? '2px solid #27ae60' : '1.5px solid #e5e7e9', background: filter === 'paid' ? '#eafaf1' : '#fff', color: '#229954', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Paid</button>
        <button onClick={() => setFilter('notpaid')} style={{ padding: '8px 22px', borderRadius: 8, border: filter === 'notpaid' ? '2px solid #e74c3c' : '1.5px solid #e5e7e9', background: filter === 'notpaid' ? '#fdecea' : '#fff', color: '#c0392b', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Not Paid</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, or ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #b2babb", fontSize: 17, background: '#f8f8fa', maxWidth: 350 }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ padding: '0 12px', border: 'none', background: '#eee', borderRadius: 8, fontSize: 18, cursor: 'pointer', color: '#6c3483' }}>✕</button>
        )}
      </div>
      {success && <div style={{ color: "#229954", marginBottom: 10, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{success}</div>}
      <div style={{ marginTop: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,62,80,0.07)' }}>
          <thead>
            <tr style={{ background: '#f8f8fa', color: '#6c3483' }}>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>ID</th>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700, width: '22%' }}>Name</th>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Email</th>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Phone</th>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Amount</th>
              <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#b2babb', fontSize: 15, padding: 20 }}>No users found.</td></tr>
            )}
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#fff', transition: 'background 0.2s' }}>
                <td style={{ padding: '9px 8px', color: '#333', fontWeight: 500 }}>{user.studentId || user.id}</td>
                <td style={{ padding: '9px 8px', color: '#222', width: '22%' }}>{user.name || '-'}</td>
                <td style={{ padding: '9px 8px', color: '#555' }}>{user.email || '-'}</td>
                <td style={{ padding: '9px 8px', color: '#555' }}>{user.phone || '-'}</td>
                <td style={{ padding: '9px 8px' }}>
                  <span style={{
                    background: user.cashPaid ? 'linear-gradient(90deg,#27ae60 60%,#52be80 100%)' : 'linear-gradient(90deg,#e74c3c 60%,#f1948a 100%)',
                    color: '#fff',
                    padding: '4px 14px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: user.cashPaid ? '0 1px 4px #27ae6022' : '0 1px 4px #e74c3c22',
                    letterSpacing: 0.5,
                    display: 'inline-block',
                    minWidth: 70,
                    textAlign: 'center',
                    border: user.cashPaid ? '1px solid #229954' : '1px solid #c0392b'
                  }}>{user.cashPaid ? 'Paid' : 'Not Paid'}</span>
                </td>
                <td style={{ padding: '9px 8px', color: '#555' }}>{user.cashAmount || '-'}</td>
                <td style={{ padding: '9px 8px' }}>
                  {!user.cashPaid && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        placeholder="Amount (AED)"
                        value={cashAmount}
                        onChange={e => setCashAmount(e.target.value)}
                        style={{ padding: 6, width: 90, borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
                      />
                      <button onClick={() => handleMarkPaid(user)} style={{ padding: '6px 14px', borderRadius: 6, background: '#27ae60', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Mark as Paid</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashPayment;
