import React, { useRef, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Logo from '../../assets/vunalogos.png';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf
} from '@react-pdf/renderer';
import { QRCodeCanvas } from 'qrcode.react';
import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;

// ✅ PDF RECEIPT COMPONENT
const ReceiptPDF = ({ reference, amount, quota, planName, qrBase64 }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.logo} src={Logo} />
        <Text>VERITAS UNIVERSITY ABUJA</Text>
        <Text>EXEAT MANAGEMENT SYSTEM</Text>
      </View>

      <Text style={styles.title}>Payment Receipt</Text>

      <View style={styles.section}>
        <Text><Text style={styles.fieldLabel}>Reference:</Text> {reference}</Text>
        <Text><Text style={styles.fieldLabel}>Plan:</Text> {planName}</Text>
        <Text><Text style={styles.fieldLabel}>Amount:</Text> ₦{amount?.toLocaleString()}</Text>
        <Text><Text style={styles.fieldLabel}>Quota:</Text> {quota}</Text>
        <Text><Text style={styles.fieldLabel}>Date:</Text> {new Date().toLocaleString()}</Text>
      </View>

      {qrBase64 && <Image style={styles.qrImage} src={qrBase64} />}
    </Page>
  </Document>
);

// ✅ STYLES
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    backgroundColor: '#fff',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 50,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    color: '#0f9d58',
  },
  section: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontWeight: 600,
  },
  qrImage: {
    marginTop: 20,
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});

// ✅ MAIN SUCCESS PAGE COMPONENT
const SuccessPage = () => {
  const location = useLocation();
  const { reference, amount, quota, planName } = location.state || {};

  const qrRef = useRef();
  const [qrBase64, setQrBase64] = useState('');

  useEffect(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      setQrBase64(canvas.toDataURL('image/png'));
    }
  }, []);

  const downloadPDF = async () => {
    try {
      const blob = await pdf(
        <ReceiptPDF
          reference={reference}
          amount={amount}
          quota={quota}
          planName={planName}
          qrBase64={qrBase64}
        />
      ).toBlob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `receipt_${reference}.pdf`;
      link.click();
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', margin: '10px' }}>
      {/* Hidden QR Code for Canvas Conversion */}
      <div ref={qrRef} style={{ display: 'none' }}>
        <QRCodeCanvas value={`http://localhost:2500/payments/verify/${reference}`} size={100} />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full" style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" className="w-35 h-25 mx-auto mb-4" style={{}} />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your payment. Your transaction has been completed successfully.</p>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <p className="text-gray-500 mb-2"><strong>Reference:</strong> {reference}</p>
          <p className="text-gray-500 mb-2"><strong>Amount:</strong> {amount ? `₦${amount.toLocaleString()}` : 'Not specified'}</p>
          <p className="text-gray-500 mb-2"><strong>Quota:</strong> {quota ? `${quota} quota` : 'Not specified'}</p>
          <p className="text-gray-500 mb-2"><strong>Plan Name:</strong> {planName || 'Not specified'}</p>
        </div>

        <p className="text-gray-500 mb-6">Your quota has been updated accordingly.</p>

        {/* ✅ WORKING DOWNLOAD BUTTON */}
        {qrBase64 && (
          <button
            onClick={downloadPDF}
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
            style={{ backgroundColor: '#0f9d58', color: 'white', padding: '10px 10px', borderRadius: '5px', cursor: 'pointer', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' }}
          >
            Download Receipt
          </button>
        )}
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <p className="text-gray-500 mb-4">A copy of your receipt has been sent to your email.</p>
          <p className="text-gray-500 mb-4">You can also view your payment history in your dashboard.</p>
          <p className="text-gray-500 mb-4">If you have any questions, please contact support.</p>
          <p className="text-gray-500 mb-4">For any issues, please email us at: <a href="mailto:exeat@veritas.edu.ng">exeat@veritas.edu.ng</a></p>
        </div>


        <br />
        <Link to="/student-dashboard" className="text-blue-500 hover:underline">Go to Dashboard</Link>
      </div>
    </div>
  );
};

export default SuccessPage;
