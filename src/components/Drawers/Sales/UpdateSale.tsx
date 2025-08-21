// @ts-nocheck

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import axios from "axios";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { SalesFormValidation } from "../../../Validation/SalesformValidation";
import { colors } from "../../../theme/colors";
import {
  Edit,
  Package,
  DollarSign,
  Users,
  Hash,
  Calculator,
  MessageSquare,
} from "lucide-react";

const UpdateSale = ({ editshow, seteditsale, sale, refresh }) => {
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partiesData, setpartiesData] = useState([]);
  const [products, setProducts] = useState([]);

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: {
        party: sale?.party_id?.[0]?._id || "",
        product_id: sale?.product_id?.[0]?._id || "",
        price: sale?.price || "",
        product_qty: sale?.product_qty || "",
        product_type: sale?.product_type || "finished goods",
        GST: sale?.GST || "",
        comment: sale?.comment || "",
        terms_of_delivery: sale?.terms_of_delivery || "",
        uom: sale?.uom || "",
        mode_of_payment: sale?.mode_of_payment || "",
      },
      validationSchema: SalesFormValidation,
      enableReinitialize: true,
      onSubmit: async (value) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
          await axios.patch(
            `${process.env.REACT_APP_BACKEND_URL}sale/update/${sale._id}`,
            value,
            {
              headers: {
                Authorization: `Bearer ${cookies.access_token}`,
              },
            }
          );

          toast.success("Sale updated successfully");

          seteditsale(!editshow);
          await refresh();
        } catch (error) {
          console.error("Error saving sale:", error);
          toast.error("Something went wrong. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });

  const fetchDropdownData = async () => {
    try {
      const [partiesRes, productRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}parties/get`, {
          headers: { Authorization: `Bearer ${cookies.access_token}` },
        }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}product/all`, {
          headers: { Authorization: `Bearer ${cookies.access_token}` },
        }),
      ]);

      const filteredProducts = (productRes.data.products || []).filter(
        (product: any) => product.category == "finished goods"
      );
      setpartiesData(partiesRes.data.data || []);
      setProducts(filteredProducts || []);
    } catch (error) {
      toast.error("Failed to fetch data for dropdowns.");
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, [cookies.access_token, toast]);
  return (
    <>
      {/* Backdrop Overlay */}
      {editshow && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => seteditsale(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          editshow ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Update Sale</h2>
            </div>
            <button
              onClick={() => seteditsale(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <BiX size={24} className="text-white" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Party Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  Party *
                </label>
                <select
                  required
                  name="party"
                  value={values.party}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900"
                >
                  <option value="">Select a party</option>
                  {partiesData.map((parties: any) => (
                    <option key={parties?._id} value={parties?._id}>
                      {parties?.full_name}{" "}
                      {parties?.company_name
                        ? ` - ${parties?.company_name}`
                        : ""}
                    </option>
                  ))}
                </select>
                {touched.party && errors.party && (
                  <p className="text-red-500 text-sm">{errors.party}</p>
                )}
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Package className="h-4 w-4 text-gray-500" />
                  Product *
                </label>
                <select
                  required
                  name="product_id"
                  value={values?.product_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900"
                >
                  <option value="">Select a product</option>
                  {products.map((product: any) => (
                    <option key={product?._id} value={product?._id}>
                      {product?.name}
                    </option>
                  ))}
                </select>
                {touched.product_id && errors.product_id && (
                  <p className="text-red-500 text-sm">{errors.product_id}</p>
                )}
              </div>

              {/* Price and Quantity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={values.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter price"
                    required
                  />
                  {touched.price && errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Hash className="h-4 w-4 text-gray-500" />
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="product_qty"
                    value={values.product_qty}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter quantity"
                    required
                  />
                  {touched.product_qty && errors.product_qty && (
                    <p className="text-red-500 text-sm">{errors.product_qty}</p>
                  )}
                </div>
              </div>

              {/* GST Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calculator className="h-4 w-4 text-gray-500" />
                  GST Rate *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[18, 12, 5].map((rate) => (
                    <label
                      key={rate}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        values.GST === String(rate)
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="GST"
                        value={rate}
                        checked={values.GST === String(rate)}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="sr-only"
                      />
                      <span className="font-medium">{rate}%</span>
                    </label>
                  ))}
                </div>
                {touched.GST && errors.GST && (
                  <p className="text-red-500 text-sm">{errors.GST}</p>
                )}
              </div>

              {/* UOM Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calculator className="h-4 w-4 text-gray-500" />
                  Unit of Measurement (UOM)
                </label>
                <input
                  type="text"
                  name="uom"
                  value={values.uom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter UOM (e.g., kg, pcs, meters)"
                  readOnly
                />
              </div>

              {/* Mode of Payment */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Mode of Payment *
                </label>
                <select
                  name="mode_of_payment"
                  value={values.mode_of_payment || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white text-gray-900"
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT/RTGS">NEFT/RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
                {touched.mode_of_payment && errors.mode_of_payment && (
                  <p className="text-red-500 text-sm">
                    {errors.mode_of_payment}
                  </p>
                )}
              </div>

              {/* Terms of Delivery */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Terms of Delivery
                </label>
                <textarea
                  name="terms_of_delivery"
                  value={values.terms_of_delivery}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Enter terms of delivery..."
                />
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Remarks (Optional)
                </label>
                <textarea
                  name="comment"
                  value={values.comment}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Add any additional notes or comments..."
                />
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => seteditsale(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  "Update Sale"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateSale;
