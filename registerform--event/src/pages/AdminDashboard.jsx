
// import React only once at the top
// (already imported above)
// (already imported above)
// (already imported above)
import Logo from "../images/bcst.jpeg";
import UserTable from "../component/UserTable.jsx";
import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUserPlus, FaSignInAlt, FaSignOutAlt, FaCoffee, FaUsers } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import AdminLoginForm from "./AdminLoginForm.jsx";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState("");
  const [kidsSearch, setKidsSearch] = useState("");
  const [teensSearch, setTeensSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [cashAmount, setCashAmount] = useState("");
  const [cashStatus, setCashStatus] = useState("");

  // Listen for sidebar tab change events
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'kids' || e.detail === 'teens') setTab(e.detail);
    };
    window.addEventListener('dashboardTabChange', handler);
    return () => window.removeEventListener('dashboardTabChange', handler);
  }, []);

  // ...rest of hooks and logic...

  // No login check, always render dashboard
  // Helper for medical text
  const getMedicalText = (user) => {
    if (!user.medicalConditions?.length) return "N/A";
    const conditions = user.medicalConditions.join(", ");
    return user.medicalNotes ? `${conditions} (${user.medicalNotes})` : conditions;
  };

  // ...existing code...

  // Place this inside the return statement of AdminDashboard, where you want the ID Card Preview to appear:
  // {/* ID Card Preview (matches registration form) */}
  // <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.08)', maxWidth: 350, marginLeft: 'auto', marginRight: 'auto' }}>
  //   <h3 style={{ textAlign: 'center', marginBottom: 10, color: '#6c3483' }}>User ID Card Preview</h3>
  //   {selectedUser && (
  //     <div style={{ border: '2px solid #6c3483', borderRadius: 12, padding: 16, background: '#fff', textAlign: 'center' }}>
  //       <div style={{ marginBottom: 8 }}>
  //         <img src={Logo} alt="Logo" style={{ maxWidth: 60, marginBottom: 4 }} />
  //         <div style={{ fontWeight: 700, color: '#6c3483', fontSize: 18 }}>Deo Gratias 2025</div>
  //         <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Teens & Kids Retreat</div>
  //         <div style={{ fontSize: 12, color: '#555' }}>(Dec 28 – 30) | St. Mary’s Church, Dubai</div>
  //         <div style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>P.O. BOX: 51200, Dubai, U.A.E</div>
  //       </div>
  //       <div style={{ fontWeight: 600, fontSize: 16, margin: '8px 0' }}>{selectedUser.participantName || selectedUser.name}</div>
  //       <div style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>
  //         Category: {selectedUser.categoryLabel || selectedUser.category || 'N/A'} | Medical: {getMedicalText(selectedUser)}
  //       </div>
  //       <div style={{ margin: '10px 0' }}>
  //         <QRCodeCanvas value={selectedUser.studentId || selectedUser.id} size={90} />
  //       </div>
  //       <div style={{ fontWeight: 700, color: '#6c3483', fontSize: 16, letterSpacing: 1 }}>{selectedUser.studentId || selectedUser.id}</div>
  //     </div>
  //   )}
  // </div>
  // (all hooks are now declared at the top, do not redeclare)
  // Filter users for cash payment search
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.participantName && u.participantName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.primaryContactNumber && u.primaryContactNumber.toLowerCase().includes(q))
    );
  });

  // Kids and Teens filters
  const kidsUsers = users.filter(u => Number(u.age) >= 8 && Number(u.age) <= 12);
  const teensUsers = users.filter(u => Number(u.age) >= 13 && Number(u.age) <= 18);
  const filteredKids = kidsUsers.filter(u => {
    const q = kidsSearch.toLowerCase();
    return (
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.participantName && u.participantName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.primaryContactNumber && u.primaryContactNumber.toLowerCase().includes(q))
    );
  });
  const filteredTeens = teensUsers.filter(u => {
    const q = teensSearch.toLowerCase();
    return (
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.participantName && u.participantName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.primaryContactNumber && u.primaryContactNumber.toLowerCase().includes(q))
    );
  });

  // Mark user as paid
  const handleMarkPaid = async () => {
    if (!selectedUser || !cashAmount) return;
    setCashStatus("Saving...");
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        cashPaid: true,
        cashAmount: parseFloat(cashAmount),
        cashPaidAt: new Date().toISOString(),
      });
      setCashStatus("Saved!");
      setTimeout(() => setCashStatus(""), 1500);
      setSelectedUser(null);
      setCashAmount("");
    } catch (err) {
      setCashStatus("Error saving");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];


  // ---------- Today's Attendance ----------
  const todayAttendance = attendance.filter(a => a.date === todayStr && a.mode === "signin");

  // Only consider registered users
  const todayAttendanceRegistered = todayAttendance.filter(a =>
    users.some(u => u.id === a.studentId)
  );

  const todayPresent = todayAttendanceRegistered.length;
  const sessionIn = todayPresent;
  const totalRegisters = users.length;
  const sessionOut = Math.max(totalRegisters - sessionIn, 0);
  const totalBreaks = users.reduce((acc, u) => acc + (u.breaks?.length || 0), 0);
  const todayAbsent = Math.max(totalRegisters - todayPresent, 0);

  const presentNames = todayAttendanceRegistered.map(a => a.studentName || "Unknown").join(", ");

  // ---------- Stats Cards ----------
  const stats = [
    { title: "Total Registers", value: totalRegisters, icon: <FaUserPlus />, color: "#2980b9" },
    { title: "Session In", value: sessionIn, icon: <FaSignInAlt />, color: "#27ae60" },
    { title: "Session Out", value: sessionOut, icon: <FaSignOutAlt />, color: "#c0392b" },
    { title: "Breaks Taken", value: totalBreaks, icon: <FaCoffee />, color: "#f39c12" },
    { title: "Today's Present", value: todayPresent, icon: <FaUsers />, color: "#8e44ad" },
  ];

  // ---------- Weekly Attendance ----------
  const getLast7Days = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
  };

  const last7Days = getLast7Days();

  const weeklyData = last7Days.map(date => {
    const studentsPresent = attendance.filter(a => a.date === date && a.mode === "signin").length;
    return { studentsPresent };
  });

  const chartData = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString("en-US", { weekday: "short" })),
    datasets: [
      { label: "Students Present", data: weeklyData.map(w => w.studentsPresent), backgroundColor: "#2980b9", borderRadius: 6 },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Weekly Attendance", font: { size: 18 } },
    },
    scales: { y: { beginAtZero: true } },
  };

  // Tab button style (move above return)
  const tabBtnStyle = {
    padding: '8px 22px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    boxShadow: '0 2px 8px #6c348322',
    transition: 'background 0.2s, color 0.2s',
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button onClick={() => setTab('all')} style={{ ...tabBtnStyle, background: tab === 'all' ? '#6c3483' : '#f5f5f5', color: tab === 'all' ? '#fff' : '#6c3483' }}>All</button>
        <button onClick={() => setTab('kids')} style={{ ...tabBtnStyle, background: tab === 'kids' ? '#6c3483' : '#f5f5f5', color: tab === 'kids' ? '#fff' : '#6c3483' }}>Kids (8-12)</button>
        <button onClick={() => setTab('teens')} style={{ ...tabBtnStyle, background: tab === 'teens' ? '#6c3483' : '#f5f5f5', color: tab === 'teens' ? '#fff' : '#6c3483' }}>Teens (13-18)</button>
      </div>

      {/* Stats Cards */}
      <div style={styles.grid}>
        {stats.map(stat => (
          <div key={stat.title} style={{ ...styles.card, borderLeft: `5px solid ${stat.color}` }}>
            <div style={styles.icon}>{stat.icon}</div>
            <div>
              <h3 style={styles.cardTitle}>{stat.title}</h3>
              <p style={styles.cardValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Attendance */}
      <div style={styles.summary}>
        <p><strong>Today's Attendance:</strong></p>
        <p>Present ({todayPresent}): {presentNames}</p>
        <p>Absent ({todayAbsent})</p>
      </div>

      {/* Cash Payment Section (only in All tab) */}
      {tab === 'all' && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3>Cash Payment Tracking</h3>
          <input
            type="text"
            placeholder="Search by ID, name, email, or phone"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, width: 260, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          {search && (
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 10 }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: 6, border: '1px solid #eee' }}>ID</th>
                    <th style={{ padding: 6, border: '1px solid #eee' }}>Name</th>
                    <th style={{ padding: 6, border: '1px solid #eee' }}>Email</th>
                    <th style={{ padding: 6, border: '1px solid #eee' }}>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding: 6, border: '1px solid #eee' }}>{u.studentId || u.id}</td>
                      <td style={{ padding: 6, border: '1px solid #eee' }}>{u.participantName}</td>
                      <td style={{ padding: 6, border: '1px solid #eee' }}>{u.email}</td>
                      <td style={{ padding: 6, border: '1px solid #eee' }}>
                        <button onClick={() => setSelectedUser(u)} style={{ padding: '2px 10px', borderRadius: 5, background: '#27ae60', color: '#fff', border: 'none', cursor: 'pointer' }}>Select</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedUser && (
            <div style={{ marginBottom: 10, marginTop: 10, background: '#f9f9f9', padding: 10, borderRadius: 8 }}>
              <b>Selected:</b> {selectedUser.participantName} ({selectedUser.studentId})<br />
              <input
                type="number"
                placeholder="Amount paid (AED)"
                value={cashAmount}
                onChange={e => setCashAmount(e.target.value)}
                style={{ padding: 6, width: 120, marginRight: 8, borderRadius: 5, border: '1px solid #ccc' }}
              />
              <button onClick={handleMarkPaid} style={{ padding: '6px 18px', borderRadius: 5, background: '#2980b9', color: '#fff', border: 'none', cursor: 'pointer' }}>Mark as Paid</button>
              <span style={{ marginLeft: 10, color: cashStatus === 'Saved!' ? 'green' : 'red' }}>{cashStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* All Registered Users Table (All tab) */}
      {tab === 'all' && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3>All Registered Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <UserTable users={users} />
          </div>
        </div>
      )}

      {/* Kids Tab */}
      {tab === 'kids' && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3>Kids (8-12 years)</h3>
          <input
            type="text"
            placeholder="Search by ID, name, email, or phone"
            value={kidsSearch}
            onChange={e => setKidsSearch(e.target.value)}
            style={{ padding: 8, width: 260, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <div style={{ overflowX: 'auto' }}>
            <UserTable users={filteredKids} />
          </div>
        </div>
      )}

      {/* Teens Tab */}
      {tab === 'teens' && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginTop: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3>Teens (13-18 years)</h3>
          <input
            type="text"
            placeholder="Search by ID, name, email, or phone"
            value={teensSearch}
            onChange={e => setTeensSearch(e.target.value)}
            style={{ padding: 8, width: 260, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <div style={{ overflowX: 'auto' }}>
            <UserTable users={filteredTeens} />
          </div>
        </div>
      )}

      <div style={styles.chartContainer}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );


};

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 20, fontFamily: "Arial, sans-serif", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15 },
  card: { display: "flex", alignItems: "center", gap: 10, backgroundColor: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
  cardTitle: { fontSize: 14, color: "#555", margin: 0 },
  cardValue: { fontSize: 18, fontWeight: "bold", margin: 0 },
  icon: { fontSize: 24, padding: 8, borderRadius: 50, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" },
  summary: { background: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
  chartContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", height: 300 },
};

export default AdminDashboard;
