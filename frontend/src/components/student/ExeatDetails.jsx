import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import Logo from '../../assets/unnamed.png';
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const ExeatDetails = () => {
  const { exeatId } = useParams();
  const [exeat, setExeat] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pdfRef = useRef();

  useEffect(() => {
    const fetchExeatAndQR = async () => {
      try {
        const exeatRes = await axios.get(`${BACKEND_API}/api/exeats/id/${exeatId}`, { withCredentials: true });
        setExeat(exeatRes.data);

        const qrRes = await axios.get(`${BACKEND_API}/api/exeats/generate-qr/${exeatId}`, { withCredentials: true });
        setQrImage(qrRes.data.qrImage);
      } catch (err) {
        console.error(err);
        setError("Failed to load exeat details or QR code.");
      } finally {
        setLoading(false);
      }
    };
    fetchExeatAndQR();
  }, [exeatId]);

  const savePDF = () => {
    html2pdf().set({
      margin: 0,
      filename: `exeat-${exeat?.matricNumber || 'document'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(pdfRef.current).save();
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#555' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={styles.wrapper}>
      <div>
        <div ref={pdfRef} style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logoSection}>
              <img src={Logo} alt="Logo" style={styles.logo} />
              <div style={styles.titleBox}>
                <h1 style={styles.title}>
                  EXEAT<br />MANAGEMENT<br />SYSTEM
                </h1>
              </div>
            </div>
            {qrImage && (
              <div style={styles.qrSection}>
                <img src={qrImage} alt="QR Code" style={styles.qrCode} />
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '10px',
                  color: exeat.requestStatus === 'approved' ? 'green' :
                    exeat.requestStatus === 'pending' ? 'orange' : 'red'
                }}>
                  {exeat.requestStatus?.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Sections */}
          <Section title="Student Information">
            <Row label="Name" value={exeat?.user?.name} />
            <Row label="Matric Number" value={exeat.matricNumber} />
            <Row label="Email" value={exeat?.user?.email} />
          </Section>

          <Section title="Exeat Details">
            <Row label="Purpose" value={exeat.purpose} />
            <Row label="Destination" value={exeat.destination} />
            <Row label="Departure" value={new Date(exeat.departureDate).toLocaleDateString()} />
            <Row label="Return" value={new Date(exeat.returnDate).toLocaleDateString()} />
            <Row label="Used" value={exeat.isUsed ? 'Yes' : 'No'} />
          </Section>

          {exeat.recommendedBy && (
            <Section title="Recommendation">
              <Row label="By" value={exeat.recommendedBy.name} />
              <Row label="Reason" value={exeat.rejectionReason} />
              <Row label="Role" value={exeat.recommendedBy.role} />
              <Row label="Date" value={exeat.recommendationDate ? new Date(exeat.recommendationDate).toLocaleDateString() : 'N/A'} />
            </Section>
          )}

          {exeat.requestStatus === "rejected" && (
            <Section title="Rejection">
              <Row label="By" value={exeat.rejectedBy ? exeat.rejectedBy.name : "Auto-Reject Cron Job"} />
              <Row label="Email" value={exeat.rejectedBy ? exeat.rejectedBy.email : 'N/A'} />
              <Row label="Role" value={exeat.rejectedBy ? exeat.rejectedBy.role : 'N/A'} />
              <Row label="Date" value={exeat.rejectedAt ? new Date(exeat.rejectedAt).toLocaleDateString() : 'N/A'} />
              <Row label="Reason" value={exeat.rejectionReason} />
            </Section>
          )}

          {exeat.approvedBy && (
            <Section title="Approval">
              <Row label="By" value={exeat.approvedBy.name} />
              <Row label="Email" value={exeat.approvedBy.email} />
              <Row label="Role" value={exeat.approvedBy.role} />
              <Row label="Date" value={exeat.approvalDate ? new Date(exeat.approvalDate).toLocaleDateString() : 'N/A'} />
              {exeat.approvedBy.signature && (
                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    textAlign: 'right',
                  }}
                >
                  <img
                    src={exeat.approvedBy.signature}
                    alt="Signature"
                    style={{
                      // marginLeft:'200px',
                      alignItems: 'center',
                      maxWidth: '200px',
                      height: 'auto',
                      padding: '4px',
                      // borderRadius: '4px',
                      backgroundColor: '#fff',
                      borderBottom: '1px solid black',

                    }}
                  />
                </div>
              )}

            </Section>
          )}
          <Section title="Security & Tracking">
            <Row label="Security Check" value={new Date(exeat.securityCheck).toLocaleString() || "Not yet checked"} />
            <Row label="Created At" value={new Date(exeat.createdAt).toLocaleString()} />
          </Section>
        </div>

        {/* Save Button */}
        {exeat.requestStatus === 'approved' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={savePDF} style={styles.button}>Save as PDF</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const Section = ({ title, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    <div style={styles.rowContainer}>{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <p style={styles.row}><strong>{label}:</strong> {value}</p>
);

// CSS-in-JS styles
const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    maxWidth: '800px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ccc',
    paddingBottom: '10px',
    marginBottom: '20px',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logo: {
    width: '200px',
    height: '80px',
    objectFit: 'contain',
    marginRight: '10px'
  },
  titleBox: {
    borderLeft: '4px solid #19533d',
    paddingLeft: '10px'
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#19533d',
    fontFamily: 'serif',
    margin: 0
  },
  qrSection: {
    textAlign: 'center',
    marginTop: '10px'
  },
  qrCode: {
    width: '100px',
    height: '100px',
    objectFit: 'contain'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#065f46',
    paddingBottom: '10px',
    borderBottom: '1px solid #ccc',
    marginBottom: '10px'
  },
  rowContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  row: {
    flex: '1 1 45%',
    color: '#374151',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  button: {
    backgroundColor: '#059669',
    color: '#fff',
    fontWeight: 'bold',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default ExeatDetails;
