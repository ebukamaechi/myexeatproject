import React from 'react';

const LogoutModal = ({ onCancel, onConfirm, loading }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        animation:'fadeIn 0.5s ease-in',
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '10px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Confirm Logout Request</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>Are you sure you want to logout?</p>
        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              backgroundColor: '#e5e7eb',
              borderRadius: '6px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '10px 20px',
              backgroundColor: loading ? '#d1d5db' : '#16a34a',
              color: '#fff',
              borderRadius: '6px'
            }}
          >
            {loading ? 'Logging Out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
