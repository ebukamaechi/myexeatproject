import React, { useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import Logo from '../../assets/unnamed.png';
// import html2pdf from "html2pdf.js";
const BACKEND_API = import.meta.env.VITE_API_BASE_URL;

const DeanRecommended = () => {
    const { userId } = useParams();
    const [exeats, setExeats] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState("");
    const navigate = useNavigate();

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
                <Text style={styles.title}>Student Recommended Exeats Report</Text>

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
    date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";


    useEffect(() => {
        const fetchExeats = async () => {
            let st = "recommended";
            try {
                const res = await axios.get(`${BACKEND_API}/api/exeats/status/${st}`, {
                    withCredentials: true,
                });
                setExeats(res.data);
            } catch (err) {
                console.error(err);
                toast.error(`${err.response.data.error}`);
                // setError("Could not fetch exeat records.");
            } finally {
                setLoading(false);
            }
        };
        fetchExeats();
    }, [userId]);

    const columns = [
        { name: 'Matric', selector: row => row.matricNumber, sortable: true },
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
        // {
        //     name: 'Approved By',
        //     selector: row => row.approvedBy?.name || 'N/A',
        //     sortable: true,
        // },
    ];

    return (
        <section className="max-w-6xl mx-auto bg-white shadow rounded-xl p-6 mt-8"
            style={{ animation: 'fadeIn 0.5s ease-in-out', padding: '20px', margin: '20px 10px' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 print:hidden">
                <h2 className="text-xl font-semibold text-green-800">
                    Recommended Exeats
                </h2>

                <div className="flex flex-col sm:flex-row gap-2">
                    {exeats.length > 0 && (
                        <PDFDownloadLink
                            style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
                            document={<ExeatPDFDocument exeats={exeats} />}
                            fileName={`exeat-report-${exeats[0]?.user?.matricNumber}.pdf`}
                            className="bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
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


            {/* {error && <p className="text-center py-10 text-red-500">{error}</p>} */}
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


export default DeanRecommended;
