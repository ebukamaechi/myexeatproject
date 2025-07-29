import DataTable from "react-data-table-component";
import axios from "axios";
import React, { useEffect, useState, useRef } from 'react';
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { NotebookText } from "lucide-react";
import html2pdf from "html2pdf.js";
import Logo from '../../assets/unnamed.png';
// import { defaults } from "chart.js";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';


export const DeanExeatsPage = () => {
    const [exeats, setExeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const navigate = useNavigate();

    useEffect(
        () => {
            fetchExeats();
        }, []
    );

    const fetchExeats = async () => {
        try {
            const result = await axios.get(`${BACKEND_API}/api/exeats`, { withCredentials: true });
            console.log(result);
            setExeats(result.data);

        } catch (error) {
            console.error('something failed: ', error);
            toast.error('systems error');
            setError('failed to load exeats');
        } finally {
            setLoading(false);
        }
    };

    const filteredExeats = exeats.filter(
        item =>
            item.matricNumber?.includes(filterText) ||
            item.purpose?.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            name: 'Matric',
            selector: row => row.matricNumber,
            sortable: true,
        },
        {
            name: 'Purpose',
            selector: row => row.purpose,
            sortable: true,
        },
        {
            name: 'Departure Date',
            selector: row => new Date(row.departureDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Return Date',
            selector: row => new Date(row.returnDate).toLocaleDateString(),
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.requestStatus,
            sortable: true,
            cell: row => <span className={`badge status-${row.requestStatus}`}>{row.requestStatus}</span>,
        },
    ];


    return (
        <section style={{ padding: '20px' }}>
            <div className="bg-white shadow rounded-xl" style={{ padding: '10px ', animation: 'fadeIn 0.5s ease-in-out' }}>
                {error && <div className="text-red-500 mb-2">{error}</div>}

                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h2 className="text-lg font-semibold main-title">|Exeats</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-3 py-2 border rounded w-full sm:w-auto"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto max-w-full">
                    <div >
                        <DataTable
                            columns={columns}
                            data={filteredExeats}
                            progressPending={loading}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            pointerOnHover
                            onRowClicked={(row) => navigate(`/dean-dashboard/exeats/view/${row._id}`)}
                            noDataComponent="No exeats found."
                        />
                    </div>
                </div>
            </div>
        </section>
    )
};

export const DeanExeatDetails = () => {
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
                        <Row label="Security Check" value={new Date(exeat.securityCheck).toLocaleString() || "Not yet checked"} />
                        <Row label="Created At" value={new Date(exeat.createdAt).toLocaleString()} />
                    </Section>
                    <div className=" flex items-center justify-center">
                        {normalizedStatus === "pending" && (
                            <>
                                {/* <ActionButton label="Recommend" color="orange" onClick={() => openConfirmModal("recommend")} /> */}
                                <ActionButton label="Approve" color="green" onClick={() => openConfirmModal("approve")} />
                                <ActionButton label="Reject" color="red" onClick={() => openConfirmModal("reject")} />
                            </>
                        )}

                        {normalizedStatus === "recommended" && (
                            <>
                                <ActionButton label="Approve" color="green" onClick={() => openConfirmModal("approve")} />
                                <ActionButton label="Reject" color="red" onClick={() => openConfirmModal("reject")} />
                            </>
                        )}

                        {normalizedStatus === "rejected" && (
                            // <ActionButton label="Recommend" color="orange" onClick={() => openConfirmModal("recommend")} />
                            <p className="text-sm text-red-600">A Hostel Administrator has to recommend</p>
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

export const DeanExeatByStudent = () => {
    const styles = StyleSheet.create({
        page: {
            padding: 30,
            fontSize: 12,
            fontFamily: 'Helvetica'
        },
        title: {
            fontSize: 18,
            marginBottom: 12,
            textAlign: 'center',
            color: '#0f5132'
        },
        tableHeader: {
            flexDirection: 'row',
            borderBottom: 1,
            paddingVertical: 4,
            backgroundColor: '#e0e0e0'
        },
        tableRow: {
            flexDirection: 'row',
            borderBottom: 0.5,
            paddingVertical: 4
        },
        cell: {
            flex: 1,
            paddingHorizontal: 4
        },
        bold: {
            fontWeight: 'bold'
        }
    });

    const ExeatPDFDocument = ({ exeats }) => (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Student Exeats Report</Text>
                <Text style={{ marginBottom: 10 }}>Matric No: {exeats[0]?.user?.matricNumber || 'N/A'}</Text>

                <View style={styles.tableHeader}>
                    <Text style={[styles.cell, styles.bold]}>Purpose</Text>
                    <Text style={[styles.cell, styles.bold]}>Destination</Text>
                    <Text style={[styles.cell, styles.bold]}>Departure</Text>
                    <Text style={[styles.cell, styles.bold]}>Return</Text>
                    <Text style={[styles.cell, styles.bold]}>Status</Text>
                    <Text style={[styles.cell, styles.bold]}>Recommended By</Text>
                    <Text style={[styles.cell, styles.bold]}>Approved By</Text>
                </View>

                {exeats.map((row, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.cell}>{row.purpose}</Text>
                        <Text style={styles.cell}>{row.destination}</Text>
                        <Text style={styles.cell}>{formatDate(row.departureDate)}</Text>
                        <Text style={styles.cell}>{formatDate(row.returnDate)}</Text>
                        <Text style={styles.cell}>{row.requestStatus}</Text>
                        <Text style={styles.cell}>{row.recommendedBy?.name || 'N/A'}</Text>
                        <Text style={styles.cell}>{row.approvedBy?.name || 'N/A'}</Text>
                    </View>
                ))}
            </Page>
        </Document>
    );

    const StatusBadge = ({ status }) => {
        const colors = {
            pending: "bg-yellow-400",
            recommended: "bg-blue-500",
            approved: "bg-green-600",
            rejected: "bg-red-600",
            cancelled: "bg-gray-400",
            used: "bg-purple-600",
        };

        return (
            <span
                style={{ padding: '5px 10px', margin: '0 5px' }}
                className={`inline-block px-2 py-1 rounded text-white text-xs ${colors[status] || "bg-gray-500"}`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (date) =>
        (date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A");

    const { userId } = useParams();
    const [exeats, setExeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExeats = async () => {
            try {
                const res = await axios.get(`${BACKEND_API}/api/exeats/student-exeats/${userId}`, {
                    withCredentials: true,
                });
                setExeats(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch exeats.");
                setError("Could not fetch exeat records.");
            } finally {
                setLoading(false);
            }
        };
        fetchExeats();
    }, [userId]);

    const columns = [
        { name: 'Purpose', selector: row => row.purpose, sortable: true },
        { name: 'Destination', selector: row => row.destination, sortable: true },
        { name: 'Departure', selector: row => formatDate(row.departureDate), sortable: true },
        { name: 'Return', selector: row => formatDate(row.returnDate), sortable: true },
        {
            name: 'Status',
            selector: row => row.requestStatus,
            cell: row => <StatusBadge status={row.requestStatus} />,
            sortable: true,
        },
        {
            name: 'Recommended By',
            selector: row => row.recommendedBy?.name || 'N/A',
            sortable: true,
        },
        {
            name: 'Approved By',
            selector: row => row.approvedBy?.name || 'N/A',
            sortable: true,
        },
    ];

    return (
        <section className="max-w-6xl mx-auto bg-white shadow rounded-xl p-6 mt-8"
            style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '20px', margin: '20px 10px' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 print:hidden">
                <h2 className="text-xl font-semibold text-green-800">
                    Pending Exeats
                </h2>

                <div className="flex flex-col sm:flex-row gap-2">
                    {exeats.length > 0 && (
                        <PDFDownloadLink
                            style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
                            document={<ExeatPDFDocument exeats={exeats} />}
                            fileName={`exeat-report-${exeats[0]?.user?.matricNumber}.pdf`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                        >
                            {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
                        </PDFDownloadLink>
                    )}

                    <button
                        style={{ padding: '10px 20px' }}
                        onClick={() => navigate(-1)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
                    >
                        Back
                    </button>
                </div>
            </div>


            {error && <p className="text-center py-10 text-red-500">{error}</p>}
            {loading ? (
                <p className="text-center py-10 text-gray-500">Loading...</p>
            ) : (
                <DataTable
                    columns={columns}
                    data={exeats}
                    striped
                    highlightOnHover
                    pagination
                    responsive
                    pointerOnHover
                    onRowClicked={(row) => navigate(`/dean-dashboard/exeats/view/${row._id}`)}
                />
            )}
        </section>
    );





};