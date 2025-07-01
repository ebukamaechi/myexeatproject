import { useState } from "react";

const Test = () => {
  // const [verifyLoading, setVerifyLoading] = useState(true);
  // setVerifyLoading(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const log = async ()=>{
    console.log('hi');
  }


  return (
    <div>
      <button
        onClick={() => setShowLogoutModal(true)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          fontWeight: '500',
          backgroundColor: '#f3f4f6',
          color: '#111827',
          cursor: 'pointer',
          border: 'none'
        }}
      >
        Purchase
      </button>
            {/* Modal */}
        {showLogoutModal && (
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
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '10px',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Confirm Payment</h3>
              <p>Plan: <strong>Hello</strong></p>
              <p>Price: <strong>₦2000</strong></p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>Proceed to Paystack to complete your payment.</p>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowLogoutModal(false)} style={{ padding: '10px 16px', backgroundColor: '#e5e7eb', borderRadius: '6px' }}>Cancel</button>
                <button onClick={log} style={{ padding: '10px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '6px' }}>
                  {'Confirm & Pay'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
};

export default Test;
