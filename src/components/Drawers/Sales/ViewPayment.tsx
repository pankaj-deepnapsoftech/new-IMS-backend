// @ts-nocheck



import { FaCheckCircle } from "react-icons/fa";

const ViewPayment = ({ paymentshow, setPaymentshow }) => {
  return (
    <section
      className={`fixed ${paymentshow ? "flex" : "hidden"} inset-0 h-screen items-center justify-center bg-[#00000057] z-50`}
    >
      <div className="bg-[#1C3644] text-white w-[400px] p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center space-y-4">
        <FaCheckCircle className="text-green-500 text-5xl" />
        <h2 className="text-2xl font-semibold">Payment Successful</h2>
        <p className="text-center text-sm text-gray-300">
          Thank you! Your payment has been processed successfully.
        </p>
        <button
          onClick={() => setPaymentshow(false)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </section>
  );
};

export default ViewPayment;
