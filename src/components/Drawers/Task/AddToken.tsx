// @ts-nocheck

import { X } from "lucide-react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Badge } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { AddtokenamtFormValidation } from "../../../Validation/SalesformValidation";
import { useFormik } from "formik";
import { useState } from "react";
const AddToken = ({ showToken, setShowToken, tokenAmount, sale, refresh }) => {
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const token = cookies?.access_token;

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues: {
      token_amt: "",
    },
    validationSchema: AddtokenamtFormValidation,
    onSubmit: async (value) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_BACKEND_URL}sale/addToken/${sale}`,
          value,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(`Amount submitted: ${response.data?.message}`);

        resetForm({
          token_amt: "",
        });

        setShowToken(!showToken);
        refresh();
      } catch (error) {
        console.error("Error submitting amount:", error);

        toast.error(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <section
      className={`fixed ${
        showToken ? "flex" : "hidden"
      } inset-0 z-50 h-screen items-center justify-center bg-black bg-opacity-60`}
    >
      <div className="bg-[#1C3644] text-white w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 relative">
        <button
          onClick={() => setShowToken(false)}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition"
        >
          <X size={24} />
        </button>

        {tokenAmount && tokenAmount != undefined ? (
          <div className="text-center w-full text-lg">
            <p className="text-orange-500  mb-3 font-semibold">
              You've already added the token amount for sample :)
            </p>
            <Badge colorScheme="green">Amount: {tokenAmount}</Badge>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center">Add Amount </h2>

            <div>
              <label htmlFor="amount" className="block mb-2 font-medium">
                Amount
              </label>
              <input
                type="text"
                id="amount"
                name="token_amt"
                placeholder="Enter your amount..."
                className="w-full bg-[#5f5f5f88] text-white placeholder-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={values.token_amt}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.token_amt && errors.token_amt && (
                <p className="text-red-400 text-sm mt-1">{errors.token_amt}</p>
              )}
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={handleSubmit}
                className={` ${
                  isSubmitting ? "cursor-not-allowed" : " "
                } px-6 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 transition`}
                disabled={isSubmitting}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AddToken;
