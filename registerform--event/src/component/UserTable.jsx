import React from "react";

function UserTable({ users }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ background: '#f5f5f5' }}>
          <th style={{ padding: 8, border: '1px solid #eee' }}>ID</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Name</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Sibling Name</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Email</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Residence Location</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>DOB</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Age</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Category</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Father</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Mother</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Primary Contact</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Primary Contact Relation</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Secondary Contact</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Secondary Contact Relation</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Medical</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Additional Medical Notes</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Family ID</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Created At</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Payment</th>
          <th style={{ padding: 8, border: '1px solid #eee' }}>Delete</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.studentId || user.id}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.participantName || user.name}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.siblings && user.siblings.length > 0 ? user.siblings.map(s => s.name).join(', ') : '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.email || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.residence || user.address || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.dob || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.age || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.categoryLabel || user.category || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.fatherName || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.motherName || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.primaryContactNumber || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.primaryContactRelation || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.secondaryContactNumber || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.secondaryContactRelationship || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{Array.isArray(user.medicalConditions) ? user.medicalConditions.join(', ') : (user.medicalConditions || '-')}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.additionalMedicalNotes || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.familyId || '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>{user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleString() : '-'}</td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>
              {user.cashPaid ? (
                <span style={{ background: '#27ae60', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>Paid</span>
              ) : (
                <span style={{ background: '#e74c3c', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>Not Paid</span>
              )}
            </td>
            <td style={{ padding: 8, border: '1px solid #eee' }}>
              {/* Delete button can be added here if needed */}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
