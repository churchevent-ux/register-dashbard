import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";
import { db } from "../firebase";
import Logo from "../images/church logo2.png";

// Show latest 10 users with payment badge
const LatestUsers = () => {
  const [users, setUsers] = React.useState([]);
  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      arr.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(arr.slice(0, 10));
    });
    return () => unsub();
  }, []);
  return (
    <div style={{ width: '100%', marginTop: 8 }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 14, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,62,80,0.07)' }}>
        <thead>
          <tr style={{ background: '#f8f8fa', color: '#6c3483' }}>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>ID</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Name</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Email</th>
            <th style={{ padding: '10px 8px', borderBottom: '2px solid #eee', fontWeight: 700 }}>Payment</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#fff', transition: 'background 0.2s' }}>
              <td style={{ padding: '9px 8px', color: '#333', fontWeight: 500 }}>{u.studentId || u.id}</td>
              <td style={{ padding: '9px 8px', color: '#222' }}>{u.participantName || u.name}</td>
              <td style={{ padding: '9px 8px', color: '#555' }}>{u.email || '-'}</td>
              <td style={{ padding: '9px 8px' }}>
                <span style={{
                  background: u.cashPaid ? 'linear-gradient(90deg,#27ae60 60%,#52be80 100%)' : 'linear-gradient(90deg,#e74c3c 60%,#f1948a 100%)',
                  color: '#fff',
                  padding: '4px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: u.cashPaid ? '0 1px 4px #27ae6022' : '0 1px 4px #e74c3c22',
                  letterSpacing: 0.5,
                  display: 'inline-block',
                  minWidth: 70,
                  textAlign: 'center',
                  border: u.cashPaid ? '1px solid #229954' : '1px solid #c0392b'
                }}>{u.cashPaid ? 'Paid' : 'Not Paid'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anyPaid, setAnyPaid] = useState(false);
  const cardRef = useRef();
  const buttonRef = useRef();

  // Listen for any paid user
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setAnyPaid(snap.docs.some(doc => doc.data().cashPaid === true));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) return <div style={styles.notFound}>User not found</div>;

  // Show payment badge (modern style)
  const PaymentBadge = ({ paid }) => (
    <span style={{
      background: paid
        ? 'linear-gradient(90deg,#27ae60 60%,#52be80 100%)'
        : 'linear-gradient(90deg,#e74c3c 60%,#f1948a 100%)',
      color: '#fff',
      padding: '4px 14px',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: paid ? '0 1px 4px #27ae6022' : '0 1px 4px #e74c3c22',
      letterSpacing: 0.5,
      display: 'inline-block',
      minWidth: 70,
      textAlign: 'center',
      border: paid ? '1px solid #229954' : '1px solid #c0392b',
      marginLeft: 8
    }}>{paid ? 'Paid' : 'Not Paid'}</span>
  );

  const getMedicalText = () => {
    if (!user.medicalConditions?.length) return "None";
    const conditions = user.medicalConditions.join(", ");
    return user.medicalNotes ? `${conditions} (${user.medicalNotes})` : conditions;
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    if (buttonRef.current) buttonRef.current.style.display = "none";
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: "#fff" });
      const fileName = (user.participantName || user.name || "user")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${fileName}_ID.png`;
      link.click();

      const userDocRef = doc(db, "users", id);
      await updateDoc(userDocRef, { idGenerated: true, idGeneratedAt: new Date() });
    } catch (err) {
      console.error("Error generating ID image:", err);
    } finally {
      if (buttonRef.current) buttonRef.current.style.display = "inline-block";
    }
  };

  const handlePrint = () => {
    if (!cardRef.current) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print ID Card</title>
          <style>
            @page {
              size: 7.4cm 10.5cm;
              margin: 0;
            }
            @media print {
              html, body {
                width: 7.4cm;
                height: 10.5cm;
                margin: 0;
                padding: 0;
                background: #fff !important;
                overflow: hidden;
              }
              .print-id-card {
                width: 7.4cm !important;
                height: 10.5cm !important;
                min-width: 7.4cm !important;
                min-height: 10.5cm !important;
                max-width: 7.4cm !important;
                max-height: 10.5cm !important;
                box-sizing: border-box;
                margin: 0 !important;
                display: block;
                page-break-after: always;
                background: #fff !important;
                border: none !important;
                box-shadow: none !important;
              }
              body { display: block !important; }
            }
            body { margin:0; background:#f5f5f5; }
          </style>
        </head>
        <body>
          <div class="print-id-card">${cardRef.current.outerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div style={styles.container}>
      {anyPaid && (
        <div style={{
          background: 'linear-gradient(90deg,#27ae60 60%,#52be80 100%)',
          color: '#fff',
          padding: '12px 18px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 18,
          boxShadow: '0 2px 8px #27ae6022',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span role="img" aria-label="paid">💸</span> A customer has paid! <span style={{fontWeight:400, fontSize:15}}>(See notifications for details)</span>
        </div>
      )}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <h2 style={styles.heading}>User Details</h2>

      <div style={styles.contentWrapper}>
        {/* Payment Status Badge */}
        <div style={{ marginBottom: 10 }}>
          Payment Status: <PaymentBadge paid={user.cashPaid} />
        </div>
        {/* User Info Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <tbody>
              <tr><td style={styles.tableLabel}>Name</td><td style={styles.tableValue}>{user.participantName || user.name}</td></tr>
              {user.siblings && user.siblings.length > 0 ? (
                <tr><td style={styles.tableLabel}>Sibling Name</td><td style={styles.tableValue}>{user.siblings.map(s => s.name).join(', ')}</td></tr>
              ) : null}
              <tr><td style={styles.tableLabel}>ID</td><td style={styles.tableValue}>{user.studentId || user.id}</td></tr>
              <tr><td style={styles.tableLabel}>Email</td><td style={styles.tableValue}>{user.email}</td></tr>
              <tr><td style={styles.tableLabel}>Phone (Father)</td><td style={styles.tableValue}>{user.contactFatherMobile || user.primaryContactNumber || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Primary Contact Number</td><td style={styles.tableValue}>{user.primaryContactNumber || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Primary Contact Relation</td><td style={styles.tableValue}>{user.primaryContactRelation || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Secondary Contact Number</td><td style={styles.tableValue}>{user.secondaryContactNumber || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Secondary Contact Relation</td><td style={styles.tableValue}>{user.secondaryContactRelationship || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Address</td><td style={styles.tableValue}>{user.residence || user.address}</td></tr>
              <tr><td style={styles.tableLabel}>DOB</td><td style={styles.tableValue}>{user.dob || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Age</td><td style={styles.tableValue}>{user.age || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Category</td><td style={styles.tableValue}>{user.categoryLabel || user.category || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Family ID</td><td style={styles.tableValue}>{user.familyId || '-'}</td></tr>
              <tr><td style={styles.tableLabel}>Status</td><td style={styles.tableValue}>{user.inSession ? "Online" : "Offline"}</td></tr>
              <tr><td style={styles.tableLabel}>Medical Issue</td><td style={styles.tableValue}>{getMedicalText()}</td></tr>
              <tr><td style={styles.tableLabel}>Additional Medical Notes</td><td style={styles.tableValue}>{user.additionalMedicalNotes || '-'}</td></tr>
            </tbody>
          </table>
        </div>

        {/* ID Card */}
        <div style={styles.cardWrapper}>
          <h3 style={styles.cardHeading}>User ID Card</h3>
          <div ref={cardRef} style={styles.card}>
            <div style={styles.logoSection}>
              <img src={Logo} alt="Logo" style={styles.logo} />
              <h3 style={styles.organization}>Deo Gratias 2025</h3>
              <p style={styles.subText}>Teens & Kids Retreat</p>
              <p style={styles.subTextSmall}>(Dec 28 – 30) | St. Mary’s Church, Dubai</p>
            </div>

            <h2 style={{ ...styles.name, fontStyle: user.medicalConditions?.length ? "italic" : "normal" }}>
              {user.participantName || user.name}
              {user.siblings && user.siblings.length > 0 && (
                <span style={{ fontSize: 13, color: '#555', display: 'block', marginTop: 2 }}>
                  Sibling: {user.siblings.map(s => s.name).join(', ')}
                </span>
              )}
            </h2>
            <p style={styles.idText}>{user.studentId || user.id}</p>

            <div style={styles.qrWrapper}>
              <QRCodeCanvas value={user.studentId || user.id} size={150} fgColor="#e74c3c" />
            </div>
            {/* <p style={styles.addressText}>{user.residence || user.address}</p> */}
          </div>

          <div style={styles.buttonWrapper}>
            <button ref={buttonRef} onClick={handleDownload} style={styles.downloadBtn}>
              Download ID
            </button>
            <button onClick={handlePrint} style={styles.printBtn}>
              Print ID
            </button>
          </div>
        </div>
      </div>
      {/* Latest 10 Users Preview */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 18, marginBottom: 10 }}>Latest 10 Registered Users</h3>
        <LatestUsers />
        <button onClick={() => navigate('/admin/users')} style={{ marginTop: 10, padding: '8px 18px', background: '#6c3483', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>More</button>
      </div>
    </div>
  );
};

// ---------- Responsive Styles ----------
const styles = {
  container: { padding: 20, fontFamily: "Arial, sans-serif" },
  notFound: { padding: 20 },
  backButton: {
    marginBottom: 20,
    padding: "8px 16px",
    border: "1px solid #6c3483",
    borderRadius: 6,
    background: "#f5f5f5",
    cursor: "pointer",
  },
  heading: { marginBottom: 20 },
  contentWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
  },
  tableContainer: {
    flex: "1 1 300px",
    maxWidth: 400,
    minWidth: 250,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableLabel: { border: "1px solid #ccc", padding: "8px 12px", fontWeight: "bold", background: "#f9f9f9", width: "35%" },
  tableValue: { border: "1px solid #ccc", padding: "8px 12px" },
  cardWrapper: { flex: "1 1 320px", maxWidth: 360, minWidth: 280, textAlign: "center" },
  cardHeading: { marginBottom: 15 },
  card: {
    width: "100%",
    padding: 20,
    border: "2px solid #6c3483",
    borderRadius: 12,
    textAlign: "center",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  logoSection: { marginBottom: 12 },
  logo: { maxWidth: 80, marginBottom: 6 },
  organization: { margin: "4px 0", fontSize: 15, color: "#2c3e50" },
  subText: { margin: "2px 0", fontSize: 13, color: "#555" },
  subTextSmall: { margin: "2px 0", fontSize: 12, color: "#777" },
  name: { margin: 5, color: "#6c3483" },
  idText: { margin: 5, fontWeight: "bold" },
  qrWrapper: { marginTop: 15 },
  addressText: { fontSize: 12, color: "#555", marginTop: 12 },
  buttonWrapper: { marginTop: 20, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" },
  downloadBtn: { padding: "10px 20px", background: "#6c3483", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  printBtn: { padding: "10px 20px", background: "#117864", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
};

export default UserDetails;
