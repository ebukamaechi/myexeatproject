import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import paystackImage from '../../assets/SBP Tag - Payment Channels - NG (1).png';


const Pricing = ({ user }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/pricing`, { withCredentials: true });
        setPlans(res.data);
      } catch (err) {
        console.error('Failed to load pricing plans:', err);
      }
    };
    fetchPlans();
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style); // Clean up when unmounting
    };
  }, [apiBaseUrl]);

  const handlePurchase = (plan) => {
    setSelectedPlan(plan);
    setError('');
    setShowModal(true);
  };

  const confirmPayment = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      const res = await axios.post(`${apiBaseUrl}/api/payments/initiate`, {
        user: user.id,
        quota: selectedPlan.quantity,
        amount: selectedPlan.amount,
       reference: `VEMS-${Date.now()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        status: 'pending',
        email: user.email,
      }, { withCredentials: true });

      const ref = res.data.payment.reference;
      launchPaystack(ref, selectedPlan);
    } catch (err) {
      console.error(err);
      setError('Could not initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const launchPaystack = (reference, plan) => {
    const handler = window.PaystackPop && window.PaystackPop.setup({
      key: paystackPublicKey,
      email: user.email,
      amount: plan.amount * 100,
      ref: reference,
      callback: (response) => verifyTransaction(response.reference),
      onClose: () => alert('Transaction was cancelled'),
    });

    if (handler) handler.openIframe();
    else alert('Paystack failed to load.');
  };

  const verifyTransaction = async (reference) => {
    setVerifyLoading(true);
    try {
      const res = await axios.post(`${apiBaseUrl}/api/payments/verify`, { reference }, { withCredentials: true });
      const destination = res.data.status === 'success' ? 'payment-success' : 'payment-failed';
      navigate(`/student-dashboard/${destination}`, {
        state: {
          reference,
          amount: selectedPlan.amount,
          quota: selectedPlan.quantity,
          planName: selectedPlan.name
        }
      });
    } catch (err) {
      console.error(err);
      navigate('/student-dashboard/pricing');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Add fade-in animation via JS
  // useEffect(() => {
  //   const style = document.createElement('style');
  //   style.innerHTML = `
  //     @keyframes fadeInScale {
  //       from { opacity: 0; transform: scale(0.95); }
  //       to { opacity: 1; transform: scale(1); }
  //     }
  //   `;
  //   document.head.appendChild(style);
  // }, []);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Pricing Plans</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>Choose the plan that fits your needs.</p>

        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

        <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px'
        }}>
          {plans.length === 0 ? (
            <div style={{ fontSize: '18px', color: '#6b7280', padding: '40px' }}>No pricing plans available at the moment.</div>
          ) : (
            plans.map((plan, idx) => (
              <div
                key={plan._id || idx}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                // className='transition-transform hover:scale-105 hover:shadow-lg duration-300'
                style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '16px',
                  border: plan.featured ? '2px solid #16a34a' : '1px solid #e5e7eb',
                  boxShadow: plan.featured ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
                  width: '100%',
                  maxWidth: '300px',
                  transition: 'transform 0.3s ease',
                  animation: 'fadeInScale 0.5s ease forwards',
                  position: 'relative'
                }}
              >
                {plan.featured && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#16a34a',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderBottomLeftRadius: '6px',
                    borderTopRightRadius: '10px'
                  }}>
                    Popular
                  </div>
                )}
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>{plan.name}</h3>
                <p style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937' }}>₦{plan.amount.toLocaleString()}</p>
                <p style={{ color: '#6b7280', margin: '10px 0 24px' }}>{plan.description}</p>

                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', fontSize: '14px', color: '#374151' }}>
                  <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> {plan.quantity} quota
                  </li>
                </ul>

                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={loading || verifyLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    backgroundColor: plan.featured ? '#16a34a' : '#f3f4f6',
                    color: plan.featured ? '#fff' : '#111827',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    border: 'none'
                  }}
                >
                  {plan.amount === 0 ? 'Get Started' : 'Purchase'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && selectedPlan && (
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
              <p>Plan: <strong>{selectedPlan.name}</strong></p>
              <p>Price: <strong>₦{selectedPlan.amount.toLocaleString()}</strong></p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>Proceed to Paystack to complete your payment.</p>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 16px', backgroundColor: '#e5e7eb', borderRadius: '6px' }}>Cancel</button>
                <button onClick={confirmPayment} style={{ padding: '10px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '6px' }}>
                  {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {verifyLoading && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            backdropFilter:'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px 40px',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#374151',
              boxShadow: '0 0 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #16a34a',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              Verifying transaction...
            </div>
          </div>
        )}

        {/* Paystack image */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <img src={paystackImage} alt="Paystack Payment Channels" style={{ width: '90%', maxWidth: '500px' }} />
        </div>
      </div>
    </div>
  );
};

export default Pricing;
