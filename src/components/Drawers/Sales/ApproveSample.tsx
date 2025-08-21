// @ts-nocheck 


import { X } from "lucide-react";
import { useState } from "react";

const ApproveSample = ({ isChecked, setIsChecked }) => {

    return (
        <section className={`  ${isChecked ? "flex" : "hidden"} fixed inset-0 h-screen w-full  items-center justify-center bg-[#00000057] z-50`}>
            <div className="bg-[#273d4b] shadow-2xl rounded-2xl p-6 w-[90%] max-w-md text-center animate-fadeIn">
                <div className="flex w-full justify-end">
                    <X onClick={()=> setIsChecked(!isChecked)} size={24} className="text-white hover:text-red-400 transition"/>
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-white">Approve Sample?</h2>
                <p className="mb-6 text-white">Are you sure you want to approve this sample?</p>

                <label className="inline-flex items-center mb-6">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"

                    />
                    <span className="ml-2 text-sm text-white">I confirm the approval</span>
                </label>

                <div className="flex justify-center gap-4">
                    <button
                        className={`px-6 py-2 rounded-lg font-semibold text-white transition  bg-green-600 hover:bg-green-700`} >
                        Yes
                    </button>
                    <button className="px-6 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition">
                        No
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ApproveSample;
