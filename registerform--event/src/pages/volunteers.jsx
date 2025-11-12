// src/pages/Volunteers.js

import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Simple modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: 0,
        minWidth: 340,
        maxWidth: 440,
        boxShadow: "0 4px 24px rgba(44,62,80,0.13)",
        overflow: "hidden",
        fontFamily: 'Segoe UI, Arial, sans-serif',
        border: '1.5px solid #6c3483'
      }}>
        <div style={{
          background: '#6c3483',
          color: '#fff',
          padding: '18px 28px 12px 28px',
          borderBottom: '1.5px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Volunteer Details</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 26, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>
        <div style={{ padding: '24px 28px 18px 28px', background: '#faf9fc' }}>
          {children}
        </div>
      </div>
    </div>
  );
};


const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});


  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "volunteers"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVolunteers(data);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volunteer?")) return;
    try {
      await deleteDoc(doc(db, "volunteers", id));
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Error deleting volunteer:", err);
    }
  };

  const handleView = (vol) => {
    setSelectedVolunteer(vol);
    setEditMode(false);
    setEditData({});
    setModalOpen(true);
  };

  const handleEdit = (vol) => {
    setSelectedVolunteer(vol);
    setEditMode(true);
    setEditData(vol);
    setModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      await updateDoc(doc(db, "volunteers", selectedVolunteer.id), editData);
      setVolunteers((prev) => prev.map((v) => v.id === selectedVolunteer.id ? { ...v, ...editData } : v));
      setModalOpen(false);
    } catch (err) {
      alert("Error updating volunteer");
    }
  };


  // Search filter
  const filteredVolunteers = volunteers.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.fullName?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.toLowerCase().includes(q) ||
      v.volunteerId?.toLowerCase().includes(q) ||
      v.preferredRole?.toLowerCase().includes(q) ||
      v.preferredLocation?.toLowerCase().includes(q)
    );
  });

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading volunteers...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2
        style={{
          marginBottom: "20px",
          textAlign: "center",
          color: "#6c3483",
          fontSize: "22px",
        }}
      >
        Volunteer List
      </h2>

      {/* Search bar */}
      <div style={{ marginBottom: 18, textAlign: "right" }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, role, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 220 }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "900px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ background: "#6c3483", color: "#fff" }}>
            <tr>
              {[
                "ID",
                "Full Name",
                "DOB",
                "Age",
                "Email",
                "Phone",
                "Role",
                "Location",
                "T-Shirt Size",
                "Emergency Contact",
                "Available Dates",
                "Signature",
                "Actions",
              ].map((header) => (
                <th key={header} style={thStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredVolunteers.map((v, idx) => (
              <tr
                key={v.id}
                style={{
                  background: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                  textAlign: "center",
                  verticalAlign: "middle",
                  cursor: "pointer"
                }}
                onClick={() => handleView(v)}
              >
                <td style={tdStyle}>{v.volunteerId || "-"}</td>
                <td style={tdStyle}>{v.fullName}</td>
                <td style={tdStyle}>{v.dob}</td>
                <td style={tdStyle}>{v.age}</td>
                <td style={tdStyle}>{v.email}</td>
                <td style={tdStyle}>{v.phone}</td>
                <td style={tdStyle}>{v.preferredRole}</td>
                <td style={tdStyle}>{v.preferredLocation}</td>
                <td style={tdStyle}>{v.tshirtSize}</td>
                <td style={tdStyle}>
                  {v.emergencyName} <br /> {v.emergencyPhone}
                </td>
                <td style={tdStyle}>
                  {v.availableDates && v.availableDates.length > 0
                    ? v.availableDates.join(", ")
                    : "—"}
                </td>
                <td style={tdStyle}>{v.signature || "—"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={e => { e.stopPropagation(); handleView(v); }}
                    style={{ ...actionBtnStyle, background: '#2980b9' }}
                  >View</button>{' '}
                  <button
                    onClick={e => { e.stopPropagation(); handleEdit(v); }}
                    style={{ ...actionBtnStyle, background: '#f1c40f', color: '#222' }}
                  >Edit</button>{' '}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(v.id); }}
                    style={deleteBtnStyle}
                  >Delete</button>
                </td>
              </tr>
            ))}
            {filteredVolunteers.length === 0 && (
              <tr>
                <td colSpan="13" style={{ padding: "15px", textAlign: "center" }}>
                  No volunteers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Responsive info for small devices */}
      <p
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "#555",
          textAlign: "center",
        }}
      >
        Scroll horizontally on mobile to see all columns
      </p>

      {/* Modal for view/edit volunteer */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedVolunteer && !editMode && (
          <div>
            <table style={{ width: '100%', fontSize: 15, borderCollapse: 'separate', borderSpacing: 0, background: 'none' }}>
              <tbody>
                <tr><td style={popupLabelStyle}>ID</td><td style={popupValueStyle}>{selectedVolunteer.volunteerId || '-'}</td></tr>
                <tr><td style={popupLabelStyle}>Name</td><td style={popupValueStyle}>{selectedVolunteer.fullName}</td></tr>
                <tr><td style={popupLabelStyle}>DOB</td><td style={popupValueStyle}>{selectedVolunteer.dob}</td></tr>
                <tr><td style={popupLabelStyle}>Age</td><td style={popupValueStyle}>{selectedVolunteer.age}</td></tr>
                <tr><td style={popupLabelStyle}>Email</td><td style={popupValueStyle}>{selectedVolunteer.email}</td></tr>
                <tr><td style={popupLabelStyle}>Phone</td><td style={popupValueStyle}>{selectedVolunteer.phone}</td></tr>
                <tr><td style={popupLabelStyle}>Role</td><td style={popupValueStyle}>{selectedVolunteer.preferredRole}</td></tr>
                <tr><td style={popupLabelStyle}>Location</td><td style={popupValueStyle}>{selectedVolunteer.preferredLocation}</td></tr>
                <tr><td style={popupLabelStyle}>T-Shirt Size</td><td style={popupValueStyle}>{selectedVolunteer.tshirtSize}</td></tr>
                <tr><td style={popupLabelStyle}>Emergency Contact</td><td style={popupValueStyle}>{selectedVolunteer.emergencyName} ({selectedVolunteer.emergencyPhone})</td></tr>
                <tr><td style={popupLabelStyle}>Available Dates</td><td style={popupValueStyle}>{selectedVolunteer.availableDates?.join(', ') || '—'}</td></tr>
                <tr><td style={popupLabelStyle}>Signature</td><td style={popupValueStyle}>{selectedVolunteer.signature || '—'}</td></tr>
                <tr><td style={popupLabelStyle}>Notes</td><td style={popupValueStyle}>{selectedVolunteer.notes || '—'}</td></tr>
              </tbody>
            </table>
            <button style={{ ...actionBtnStyle, background: '#f1c40f', color: '#222', marginTop: 18, float: 'right' }} onClick={() => { setEditMode(true); setEditData(selectedVolunteer); }}>Edit</button>
            <div style={{ clear: 'both' }} />
          </div>
        )}
        {selectedVolunteer && editMode && (
          <div>
            <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} style={{ marginTop: 0 }}>
              <table style={{ width: '100%', fontSize: 15, borderCollapse: 'separate', borderSpacing: 0, background: 'none' }}>
                <tbody>
                  <tr><td style={popupLabelStyle}>Full Name</td><td style={popupValueStyle}><input name="fullName" value={editData.fullName || ''} onChange={handleEditChange} style={popupInputStyle} required /></td></tr>
                  <tr><td style={popupLabelStyle}>DOB</td><td style={popupValueStyle}><input name="dob" value={editData.dob || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Age</td><td style={popupValueStyle}><input name="age" value={editData.age || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Email</td><td style={popupValueStyle}><input name="email" value={editData.email || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Phone</td><td style={popupValueStyle}><input name="phone" value={editData.phone || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Role</td><td style={popupValueStyle}><input name="preferredRole" value={editData.preferredRole || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Location</td><td style={popupValueStyle}><input name="preferredLocation" value={editData.preferredLocation || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>T-Shirt Size</td><td style={popupValueStyle}><input name="tshirtSize" value={editData.tshirtSize || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Emergency Name</td><td style={popupValueStyle}><input name="emergencyName" value={editData.emergencyName || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Emergency Phone</td><td style={popupValueStyle}><input name="emergencyPhone" value={editData.emergencyPhone || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Available Dates</td><td style={popupValueStyle}><input name="availableDates" value={Array.isArray(editData.availableDates) ? editData.availableDates.join(', ') : (editData.availableDates || '')} onChange={e => setEditData(prev => ({ ...prev, availableDates: e.target.value.split(',').map(s => s.trim()) }))} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Signature</td><td style={popupValueStyle}><input name="signature" value={editData.signature || ''} onChange={handleEditChange} style={popupInputStyle} /></td></tr>
                  <tr><td style={popupLabelStyle}>Notes</td><td style={popupValueStyle}><textarea name="notes" value={editData.notes || ''} onChange={handleEditChange} style={{ ...popupInputStyle, minHeight: 48 }} /></td></tr>
                </tbody>
              </table>
              <button type="submit" style={{ ...actionBtnStyle, background: '#27ae60', color: '#fff', marginTop: 16, float: 'right' }}>Save</button>
              <div style={{ clear: 'both' }} />
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Styles
const thStyle = {
  padding: "12px 10px",
  fontSize: "14px",
  textAlign: "center",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "10px 8px",
  fontSize: "13px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

const deleteBtnStyle = {
  padding: "6px 12px",
  background: "#e74c3c",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
  margin: "2px 0"
};

const actionBtnStyle = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
  margin: "2px 4px 2px 0"
};



// Popup modal table styles
const popupLabelStyle = { fontWeight: 600, color: '#6c3483', padding: '7px 10px 7px 0', textAlign: 'right', width: 120, verticalAlign: 'top', fontSize: 14 };
const popupValueStyle = { color: '#222', padding: '7px 0 7px 8px', fontSize: 14, minWidth: 120, verticalAlign: 'top' };
const popupInputStyle = { width: '100%', padding: '7px 8px', borderRadius: 6, border: '1px solid #bbb', fontSize: 14, background: '#fff', marginBottom: 0 };
const labelStyle = { fontWeight: 500, fontSize: 14 };
const inputStyle = { width: "100%", padding: 7, borderRadius: 5, border: "1px solid #ccc", marginTop: 2, marginBottom: 8, fontSize: 14 };

// Optional: media queries using inline JS for mobile adjustments
// Wrap this in a useEffect if you want dynamic font resizing or column adjustments
// Example: hiding some columns on very small screens can improve UX

export default Volunteers;
