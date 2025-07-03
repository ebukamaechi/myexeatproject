import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import Logo from '../../assets/unnamed.png';
import { toast } from "react-toastify";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const HostelAdminExeatDetails = () => {
    const { exeatId } = useParams();
    const [exeat, setExeat] = useState(null);
    const [qrImage, setQrImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(""); // 'recommend' | 'reject'

    const pdfRef = useRef();
    // move this OUTSIDE useEffect
    const fetchExeatAndQR = async () => {
        try {
            setLoading(true); // optional: ensure it shows loading again
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

    // then keep your useEffect simple
    useEffect(() => {
        fetchExeatAndQR();
    }, [exeatId]);




    const openConfirmModal = (action) => {
        console.log("Opening modal for:", action);
        setPendingAction(action);
        setShowConfirmModal(true);
        console.log("showConfirmModal:", showConfirmModal);

    };


    const handleConfirmedAction = async () => {

        try {
            setShowConfirmModal(false);
            // Example API call
            await axios.put(`${BACKEND_API}/api/exeats/${pendingAction}/${exeatId}`, {}, { withCredentials: true });
            toast.success(`Exeat ${pendingAction}ed successfully!`);
            await fetchExeatAndQR(); // refresh data
        } catch (err) {
            console.error("Action failed:", err);
            toast.error(`Failed to ${pendingAction} exeat.`);
        }
    };



    const savePDF = () => {
        setLoading(true);
        try {
            html2pdf().set({
                margin: 0,
                filename: `exeat-${exeat?.matricNumber || 'document'}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            }).from(pdfRef.current).save();
        } catch (error) {
            console.log(error);

        } finally {
            setLoading(false);
        }

    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#555' }}>Loading...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    // console.log(showConfirmModal); // Add this
    const normalizedStatus = exeat?.requestStatus?.toLowerCase();

    const ActionButton = ({ label, color, onClick }) => (
        <div style={{ textAlign: 'center', margin: '10px' }}>
            <button onClick={onClick} style={{
                backgroundColor: color,
                color: '#fff',
                fontWeight: 'bold',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>{label}</button>
        </div>
    );

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
                                        exeat.requestStatus === 'pending' ? 'blue' :
                                            exeat.requestStatus === 'recommended' ? 'orange' : 'red'
                                }}>
                                    {exeat.requestStatus?.toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sections */}
                    <Section title="Student Information">
                        <Row label="Full Name" value={
                            exeat.studentDetails
                                ? `${exeat.studentDetails.lastName?.toUpperCase()} ${exeat.studentDetails.firstName} ${exeat.studentDetails.middleName || ''}`
                                : exeat?.user?.name
                        } />
                        <Row label="Matric Number" value={exeat.matricNumber} />
                        <Row label="Email" value={exeat?.user?.email} />
                        {exeat.studentDetails && (
                            <>
                                <Row label="Phone" value={exeat.studentDetails.phone} />
                                <Row label="Department" value={exeat.studentDetails.department} />
                                <Row label="Faculty" value={exeat.studentDetails.faculty} />
                                <Row label="Hostel" value={exeat.studentDetails.hostel} />
                                <Row label="State of Origin" value={exeat.studentDetails.origin} />
                                <Row label="Guardian Name" value={exeat.studentDetails.guardianName} />
                                <Row label="Guardian Phone" value={exeat.studentDetails.guardianPhone} />
                                <Row label="Address" value={exeat.studentDetails.address} />
                            </>
                        )}
                        {!exeat.studentDetails && (
                            <p style={{ color: 'red', fontStyle: 'italic' }}>
                                Student profile information not available.
                            </p>
                        )}

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
                            <Row label="Email" value={exeat.recommendedBy.email} />
                            <Row label="Role" value={exeat.recommendedBy.role} />
                            <Row label="Date" value={exeat.recommendationDate ? new Date(exeat.recommendationDate).toLocaleDateString() : 'N/A'} />
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
                        <Row label="Security Check" value={exeat.securityCheck || "Not yet checked"} />
                        <Row label="Created At" value={new Date(exeat.createdAt).toLocaleString()} />
                    </Section>   
                    <div className=" flex items-center justify-center">
                        {normalizedStatus === "pending" && (
                            <>
                                <ActionButton label="Recommend" color="orange" onClick={() => openConfirmModal("recommend")} />
                                <ActionButton label="Reject" color="red" onClick={() => openConfirmModal("reject")} />
                            </>
                        )}

                        {normalizedStatus === "recommended" && (
                            <ActionButton label="Reject" color="red" onClick={() => openConfirmModal("reject")} />
                        )}

                        {normalizedStatus === "rejected" && (
                            <ActionButton label="Recommend" color="orange" onClick={() => openConfirmModal("recommend")} />
                        )}

                        {["approved", "cancelled"].includes(normalizedStatus) && (
                            <p className="text-center text-gray-400 italic">No further actions available.</p>
                        )}
                    </div>

                </div>
                {showConfirmModal && (
                    <div style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999
                    }}>
                        <div style={{
                            animation: 'fadeIn 0.5s ease-in',
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center',
                            maxWidth: '400px'
                        }}>
                            <h2>Confirm Action</h2>
                            <p>Are you sure you want to <strong>{pendingAction}</strong> this exeat?</p>
                            <div style={{
                                marginTop: '24px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <button onClick={() => setShowConfirmModal(false)} style={{
                                    marginRight: '10px',
                                    padding: '10px 16px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '6px'
                                }}>Cancel</button>
                                <button
                                    disabled={loading}
                                    style={{
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        padding: '10px 20px',
                                        backgroundColor: loading ? '#d1d5db' : '#16a34a',
                                        color: '#fff',
                                        borderRadius: '6px'
                                    }} onClick={handleConfirmedAction}> {loading ? 'Loading...' : `Yes, ${pendingAction}`}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button disabled={loading} onClick={savePDF} style={{
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: loading ? '#d1d5db' : '#059669',
                        // backgroundColor: '#059669',
                        color: '#fff',
                        fontWeight: 'bold',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {loading ? 'Saving...' : 'Save as PDF'}</button>
                </div>
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

export default HostelAdminExeatDetails;
