import { useState } from "react";
import ExeatsReport from "./ExeatsReport";
const tabs = [
    { key: "exeat", label: "Exeats" },
    { key: "students", label: "Students" },
    { key: "payments", label: "Payments" },
    { key: "quota", label: "Quota" },
];

const DeanReports = () => {
    const [activeTab, setActiveTab] = useState("exeat");

    const renderTabContent = () => {
        switch (activeTab) {
            case "exeat":
                return <div>
                    {/* <ExeatsReport /> */}
                    exeats stuff blah blah..
                </div>;
            case "students":
                return <div>another students</div>;
            case "payments":
                return <div>payment balld</div>;
            case "quota":
                return <div>last quota</div>;
            default:
                return null;
        }
    };

    return (
        <section className="p-5">
            <div className="bg-white shadow-lg rounded-xl mx-auto p-5 animate-fade-in" style={{padding:'20px', margin:'20px 20px', animation: 'fadeIn 0.5s ease-in-out'}}>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Reports' Page</h2>
                    <p className="text-sm text-gray-500">
                        This is the section for dean's reports:
                        <br />
                        daily, weekly, bi-weekly, monthly, quarterly, annually and all-time.
                    </p>
                </div>

                <div className="flex border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2 font-medium transition border-b-2 ${
                                activeTab === tab.key
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-600 hover:text-green-600"
                            }`}
                            type="button"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="pt-4">{renderTabContent()}</div>
            </div>
        </section>
    );
};

export default DeanReports;
