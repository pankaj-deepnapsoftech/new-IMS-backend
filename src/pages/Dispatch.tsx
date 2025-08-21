//@ts-nocheck
import { useState, useRef, useEffect } from "react";
import { TbTruckDelivery } from "react-icons/tb";
import { HiOutlinePaperClip } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import { RefreshCw, Filter, Search } from "lucide-react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { DispatchFormSchema } from "../Validation/DispatchFormValidation";
import { useFormik } from "formik";
import Loading from "../ui/Loading";
import EmptyData from "../ui/emptyData";
import Pagination from "./Pagination";
import { colors } from "../theme/colors";

const Dispatch = () => {
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [productFilter, setProductFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [siteLink, setSiteLink] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showattachment, setShowAttachment] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const role = cookies?.role;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const {
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    values,
    errors,
    touched,
  } = useFormik({
    initialValues: {
      tracking_id: "",
      tracking_web: "",
    },
    validationSchema: DispatchFormSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}dispatch/createDispatch`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );

        resetForm();
        setShowModal(false);
      } catch (error) {
        console.log(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const GetDispatch = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}dispatch/get-Dispatch?page=${page}&&limit=2`,
        {
          headers: {
            Authorization: `Bearer ${cookies.access_token}`,
          },
        }
      );

      setData(response?.data?.data);

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
console.log(data)
  useEffect(() => {
    GetDispatch(page);
  }, [page]);

  const calculateTotal = (price: number, qty: number, gst: number) => {
    const basePrice = price * qty;
    const gstval = (basePrice * gst) / 100;
    const totalPrice = basePrice + gstval;
    return totalPrice;
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: colors.background.page }}
      >
        <div className="p-2 lg:p-3">
          <Loading />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: colors.background.page }}
      >
        <div className="p-2 lg:p-3">
          {/* Header Section */}
          <div
            className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <TbTruckDelivery className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage dispatch operations and track deliveries
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div
            className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <EmptyData />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="p-2 lg:p-3">
        {/* Header Section */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <TbTruckDelivery className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage dispatch operations and track deliveries
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setPaymentFilter("All");
                  setProductFilter("All");
                  setSearchTerm("");
                  GetDispatch();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                style={{
                  borderColor: colors.border.medium,
                  color: colors.text.primary,
                  backgroundColor: colors.background.card,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.background.card;
                }}
              >
                <RefreshCw size="20px" />
                Refresh
              </button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Search Dispatch
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colors.text.secondary }}
                />
                <input
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      colors.input.borderFocus;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.input.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Search by party name, product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Payment Status
              </label>
              <select
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="All">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Product Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Product Status
              </label>
              <select
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              >
                <option value="All">All Product Status</option>
                <option value="Dispatch">Dispatch</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dispatch Cards Section */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="p-6">
            <div className="space-y-6">
              {data?.map((acc: any) => (
                <div
                  key={acc?._id}
                  className="border rounded-xl border-l-4 transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: colors.background.card,
                    borderLeftColor: colors.success[500],
                    borderColor: colors.border.light,
                  }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: colors.primary[100],
                              color: colors.primary[800],
                            }}
                          >
                            Order #{acc?._id?.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: colors.text.secondary }}
                          >
                            {new Date(acc?.createdAt).toLocaleDateString()}
                          </span>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium" style={{ color: colors.text.primary }}>
                                  Party:
                                </span>
                                <span style={{ color: colors.text.secondary }}>
                                  {acc?.[0]?.customer_id?.[0]?.full_name || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium" style={{ color: colors.text.primary }}>
                                  Product:
                                </span>
                                <span style={{ color: colors.text.secondary }}>
                                  {acc?.[0]?.product_id?.[0]?.name || acc?.Product || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium" style={{ color: colors.text.primary }}>
                                  Quantity:
                                </span>
                                <span style={{ color: colors.text.secondary }}>
                                  {acc?.product_qty || acc?.Quantity || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center whitespace-nowrap gap-2">
                                <span className="font-medium" style={{ color: colors.text.primary }}>
                                  Bom Name:
                                </span>
                                <span style={{ color: colors.text.secondary }}>
                                  {acc?.Bom_name || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>


                          <div className="space-y-2">
                            {(role === "Accountant" ||
                              role === "Sales" ||
                              role === "admin") && (
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-medium"
                                  style={{ color: colors.text.primary }}
                                >
                                  Total:
                                </span>
                                <span style={{ color: colors.text.secondary }}>
                                  ₹
                                  {(
                                    acc?.Total
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span
                                className="font-medium"
                                style={{ color: colors.text.primary }}
                              >
                                Status:
                              </span>
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: acc?.Sale_id[0]
                                    ?.payment_verify
                                    ? colors.success[100]
                                    : colors.warning[100],
                                  color: acc?.Sale_id[0]?.payment_verify
                                    ? colors.success[800]
                                    : colors.warning[800],
                                }}
                              >
                                {acc?.Sale_id[0]?.payment_verify
                                  ? "Paid"
                                  : "Unpaid"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex gap-3 justify-end pt-4 border-t"
                      style={{ borderColor: colors.border.light }}
                    >
                      {acc?.Sale_id[0]?.payment_verify === true && (
                        <button
                          onClick={() => setShowModal(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            backgroundColor: colors.primary[600],
                            color: colors.text.inverse,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.primary[700];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              colors.primary[600];
                          }}
                        >
                          <TbTruckDelivery size={16} />
                          Dispatch
                        </button>
                      )}

                      <button
                        onClick={() => setShowAttachment(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          backgroundColor: colors.background.card,
                          borderColor: colors.border.medium,
                          color: colors.text.secondary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.gray[50];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.background.card;
                        }}
                      >
                        <HiOutlinePaperClip size={16} />
                        Attachment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            page={page}
            setPage={setPage}
            hasNextPage={data.length === 2}
          />
        </div>
      </div>

      {/* Dispatch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: colors.text.primary }}
                >
                  Dispatch Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      Tracking ID
                    </label>
                    <input
                      type="text"
                      name="tracking_id"
                      value={values.tracking_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: colors.text.primary }}
                    >
                      Tracking Website
                    </label>
                    <input
                      type="text"
                      name="tracking_web"
                      value={values.tracking_web}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: colors.primary[600],
                      color: colors.text.inverse,
                    }}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                    style={{
                      backgroundColor: colors.background.card,
                      borderColor: colors.border.medium,
                      color: colors.text.secondary,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showattachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-4 rounded-xl shadow-xl"
            style={{ backgroundColor: colors.background.card }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Upload Attachment
                </h3>
                <button
                  onClick={() => setShowAttachment(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: colors.text.secondary }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{
                    backgroundColor: colors.input.background,
                    borderColor: colors.input.border,
                    color: colors.text.primary,
                  }}
                />
                {fileName && (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Selected: {fileName}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: colors.primary[600],
                    color: colors.text.inverse,
                  }}
                >
                  Upload
                </button>
                <button
                  onClick={() => setShowAttachment(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
