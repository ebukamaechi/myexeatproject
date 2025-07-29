import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-toastify';
import axios from 'axios';

const BACKEND_API = import.meta.env.VITE_API_BASE_URL;
const beepSound = new Audio('/beep.mp3');

const ScanExeatPage = () => {
    const [hasScanned, setHasScanned] = useState(false);
    const [exeat, setExeat] = useState(null);
    const [loading, setLoading] = useState(false);
    const html5QrCodeRef = useRef(null);

    // useEffect(() => {
    //     if (!hasScanned) {
    //         startScanner();
    //     }

    //     return () => stopScanner(); // Cleanup on unmount
    // }, [hasScanned]);
    useEffect(() => {
    startScanner();

    return () => stopScanner(); // Cleanup on unmount
}, [hasScanned]);


const startScanner = () => {
    try {
        const qrRegionId = "qr-reader";

        if (html5QrCodeRef.current) {
            return; // already started
        }

        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length) {
                const cameraId = cameras[0].id;

                html5QrCodeRef.current.start(
                    cameraId,
                    config,
                    (decodedText) => handleScan(decodedText),
                    (error) => handleError(error)
                );
            } else {
                toast.error("No camera found");
            }
        }).catch(err => {
            toast.error("Camera access error");
            console.error(err);
        });
    } catch (error) {
        console.error("Failed to start scanner:", error);
    }
};


    // const stopScanner = () => {
    //     if (html5QrCodeRef.current) {
    //         html5QrCodeRef.current.stop().then(() => {
    //             html5QrCodeRef.current.clear();
    //         }).catch(err => console.error("Failed to stop scanner", err));
    //     }
    // };
    const stopScanner = () => {
    if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => {
            html5QrCodeRef.current.clear();
            html5QrCodeRef.current = null; // ✅ important
        }).catch(err => console.error("Failed to stop scanner", err));
    }
};


    const handleInputScan = (e) => {
        const value = e.target.value;
        if (!value) return;
        e.target.value = ""; // clear for next scan
        handleScan(value);
    };



    const handleScan = (rawValue) => {
        if (hasScanned || !rawValue) return;
        setHasScanned(true);

        try {
            const isJson = rawValue.startsWith('{') || rawValue.startsWith('[');
            const parsed = isJson ? JSON.parse(rawValue) : rawValue;

            beepSound.play().catch((e) => console.warn("Audio failed to play:", e));
            fetchExeat(parsed);
        } catch (err) {
            console.error("Invalid QR code:", rawValue, err);
            toast.error("Invalid QR code format");
        }
    };

    const handleError = (err) => {
        if (err?.name !== 'NotFoundError') {
            console.warn("Scan error:", err?.message || err);
        }
    };

    const fetchExeat = async (tokenOrData) => {
        setLoading(true);
        try {
            const token = typeof tokenOrData === 'object' ? tokenOrData.id : tokenOrData;
            const response = await axios.post(`${BACKEND_API}/api/exeats/scan/${token}`, {}, { withCredentials: true });
            setExeat(response.data.exeat || null);
            toast.success("QR scanned successfully");
        } catch (error) {
            console.error("Error fetching exeat:", error);
            toast.error(error.response?.data?.message || "Failed to fetch exeat data");
            setExeat(error.response?.data?.exeat || null);
        } finally {
            setLoading(false);
        }
    };

    const markUsed = async (qrToken) => {
        setLoading(true);
        try {
            const response = await axios.put(`${BACKEND_API}/api/exeats/mark-used/${qrToken}`, {}, { withCredentials: true });
            toast.success(response.data.message);
            resetScanner();
        } catch (error) {
            console.error(error);
            toast.error(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    // const resetScanner = () => {
    //     setHasScanned(false);
    //     setExeat(null);
    // };
    const resetScanner = () => {
    stopScanner();
    setHasScanned(false);
    setExeat(null);
    setTimeout(() => {
        startScanner(); // Restart after clearing
    }, 300); // short delay ensures QR DOM clears
};


    return (
        <section className='' style={{ padding: "20px", animation: "fadeIn 0.5s ease-in-out" }}>
            <div className="p-4" style={{
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                minHeight: '100vh',
                padding: '20px',
                boxSizing: 'border-box',
            }}>
                <h2 className="text-xl font-semibold mb-4 main-title">Scan Exeat QR Code</h2>
                <input
                    type="text"
                    onChange={handleInputScan}
                    autoFocus
                    placeholder="Scan QR code here"
                    className="mt-4 px-3 py-2 border rounded"
                />

                {!hasScanned && <div id="qr-reader" style={{ width: "100%", maxWidth: "500px", margin: "auto" }}></div>}

                {loading && <p className="mt-4 text-gray-500">Fetching exeat details...</p>}

                {exeat && (
                    <div className="mt-6 bg-white shadow p-4 rounded border border-gray-200" style={{ maxWidth: '800px' }}>
                        <h3 className="text-lg font-bold mb-2 text-center text-green-700">Exeat Details</h3>
                        <div style={{ padding: '10px' }}>
                            <p><strong>Full Name:</strong> {exeat?.user?.name}</p>
                            <p><strong>Matric Number:</strong> {exeat.matricNumber}</p>
                            <p><strong>Purpose:</strong> {exeat.purpose}</p>
                            <p><strong>Destination:</strong> {exeat.destination}</p>
                            <p><strong>Departure:</strong> {new Date(exeat.departureDate).toLocaleDateString()}</p>
                            <p><strong>Return:</strong> {new Date(exeat.returnDate).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {exeat.requestStatus}</p>
                            <p><strong>Used:</strong> {exeat.isUsed ? 'Yes' : 'No'}</p>
                        </div>

                        <div className='flex items-center justify-center flex-wrap'>
                            {exeat.requestStatus === "approved" && !exeat.isUsed && (
                                <button
                                    disabled={loading}
                                    onClick={() => markUsed(exeat.qrToken)}
                                    className='bg-green-600 hover:bg-green-500 rounded text-white px-4 py-2 m-2'
                                >
                                    {loading ? 'Saving...' : 'Confirm'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className='flex items-center justify-left flex-wrap'>
                    <button
                        onClick={resetScanner}
                        style={{padding:'20px 10px'}}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Scan Another
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ScanExeatPage;




// this code is for physical qr scanner

// import React, { useState } from 'react';
// import { toast } from 'react-toastify';

// const ScanExeatPage = () => {
//   const [input, setInput] = useState('');
//   const [parsedData, setParsedData] = useState(null);

//   const handleScanSubmit = (e) => {
//     e.preventDefault();

//     const rawValue = input.trim();
//     try {
//       const isJson = rawValue.startsWith('{') || rawValue.startsWith('[');
//       const parsed = isJson ? JSON.parse(rawValue) : rawValue;

//       setParsedData(parsed);
//       toast.success("QR scanned successfully");
//     } catch (err) {
//       console.error("Invalid QR code content:", rawValue, err);
//       toast.error("Invalid QR code format");
//     }

//     setInput('');
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold mb-4">Scan Exeat QR Code</h2>

//       <form onSubmit={handleScanSubmit}>
//         <input
//           type="text"
//           autoFocus
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Scan QR code..."
//           className="w-full p-2 border border-gray-300 rounded"
//         />
//       </form>

//       {parsedData && (
//         <div className="mt-4">
//           <p className="font-semibold">Scanned Value:</p>
//           <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
//             {typeof parsedData === 'object'
//               ? JSON.stringify(parsedData, null, 2)
//               : parsedData}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ScanExeatPage;
