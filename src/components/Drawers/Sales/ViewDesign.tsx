//@ts-nocheck
import { X } from "lucide-react";
import { useState } from "react";

const ViewDesign = ({ isOpen, setViewDesign }) => {
    const [selectedOption, setSelectedOption] = useState('');

    return (
        <section
            className={`${isOpen ? "flex" : "hidden"} fixed inset-0 z-50 items-center justify-center bg-[#00000046]`}
        >
            <div className="bg-[#1C3644] text-white w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-6 relative">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">View Design</h2>
                    <button onClick={() => setViewDesign(false)}>
                        <X size={24} className="hover:text-red-400 transition" />
                    </button>
                </div>

                <img
                    src="/img.png"
                    alt="Design preview"
                    className="w-full h-[500px] rounded-lg border border-white/10 shadow"
                />

                <div className="flex justify-center">
                    <a
                        href="/img.png"
                        download
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg shadow transition"
                    >
                        Download Design
                    </a>
                </div>


                <div className="flex flex-col gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="approve"
                            checked={selectedOption === 'approve'}
                            onChange={() => setSelectedOption('approve')}
                            className="accent-green-500"
                        />
                        <label htmlFor="approve" className="ml-3 cursor-pointer">🤗 Approve</label>
                    </div>

                    <div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="reject"
                                checked={selectedOption === 'reject'}
                                onChange={() => setSelectedOption('reject')}
                                className="accent-red-500"
                            />
                            <label htmlFor="reject" className="ml-3 cursor-pointer">☹ Reject</label>
                        </div>


                        {selectedOption === 'reject' && (
                            <input
                                type="text"
                                placeholder="Please provide feedback"
                                className="mt-3 w-full p-2 rounded-md border border-white/20 bg-white/10 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        )}
                    </div>
                </div>


                <button
                    className="mt-4 bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-lg text-white font-semibold transition shadow"
                >
                    Submit Response 
                </button>
            </div>
        </section>
    );
};

export default ViewDesign;
