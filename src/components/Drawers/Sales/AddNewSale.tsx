// @ts-nocheck

import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import axios from "axios";
import { useFormik } from "formik";
import { SalesFormValidation } from "../../../Validation/SalesformValidation";
import { IoClose } from "react-icons/io5";
import { colors } from "../../../theme/colors";
import {
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Hash,
  FileImage,
  Calculator,
  MessageSquare,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
const AddNewSale = ({ show, setShow, fetchPurchases, editTable }) => {
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partiesData, setpartiesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagesfile, setImageFile] = useState(null);
  const [bomFile, setBomFile] = useState(null);
  const [bomPreview, setBomPreview] = useState(null);

  // console.log(editTable)
  const ImageUploader = async (formData) => {
    // console.log(formData)
    try {
      const res = await axios.post(
        "https://images.deepmart.shop/upload",
        formData
      );
      console.log(res.data?.[0]);
      return res.data?.[0];
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: {
      party: editTable?.party?._id || "",
      product_id: editTable?.product_id[0]?._id || "",
      price: editTable?.price || "",
      product_qty: editTable?.product_qty || "",
      product_type: editTable?.product_type || "finished goods",
      GST: editTable?.GST || "",
      comment: editTable?.comment || "",
      terms_of_delivery: editTable?.terms_of_delivery || "",
      uom: editTable?.uom || "",
      productFile: editTable?.productFile || "",
      bompdf: editTable?.bompdf || "",
      mode_of_payment: editTable?.mode_of_payment || "",
    },
    enableReinitialize: true,
    validationSchema: SalesFormValidation,
    onSubmit: async (value) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      //    console.log("form Values",value)
      try {
        let productImageUrl = editTable?.productFile || "";
        let bomImageUrl = editTable?.bompdf || "";

        if (imagesfile) {
          const formData = new FormData();
          formData.append("file", imagesfile);
          const uploadedImage = await ImageUploader(formData);
          if (!uploadedImage) {
            toast.error("Product image upload failed");
            setIsSubmitting(false);
            return;
          }
          productImageUrl = uploadedImage;
        }

        if (bomFile) {
          const bomFormData = new FormData();
          bomFormData.append("file", bomFile);
          const uploadedBom = await ImageUploader(bomFormData);
          if (!uploadedBom) {
            toast.error("Drawing PDF upload failed");
            setIsSubmitting(false);
            return;
          }
          bomImageUrl = uploadedBom;
        }

        const payload = {
          ...value,
          productFile: productImageUrl,
          bompdf: bomImageUrl,
        };

        console.log(payload);

        if (editTable?._id) {
          const response = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}sale/update/${editTable._id}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          console.log(response.data); 
        } else {
          const res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}sale/create`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );

          await PostDataAutoCreateBom(value.product_id, value.product_qty);
        }

        // Refresh data before closing modal to ensure updated data is displayed
        await fetchPurchases();

        toast.success(
          `Sale ${editTable?._id ? "updated" : "created"} successfully`
        );

        resetForm();
        setImageFile(null);
        setImagePreview(null);
        setShow(false);
      } catch (error) {
        console.error("Error saving sale:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  // console.log(products)
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
        (product: any) => product?.category === "finished goods"
      );
      setpartiesData(partiesRes?.data?.data || []);
      setProducts(filteredProducts || []);
    } catch (error) {
      console.log("testing data", error);
      toast.error("Failed to fetch data for dropdowns.");
    }
  };

  const PostDataAutoCreateBom = async (productId, quantity) => {
    console.log("product Id", productId);
    console.log("product quantity", quantity);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}bom/autobom?product_id=${productId}&quantity=${quantity}&`,
        {
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
        }
      );
      console.log("Auto BOM created:", res?.data);
    } catch (error) {
      console.log("Auto BOM creation failed:", error);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, [cookies?.access_token, toast]);

  // console.log(products)
  useEffect(() => {
    if (editTable?.productFile) {
      setImagePreview(editTable?.productFile);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editTable]);

  return (
    <>
      {/* Backdrop Overlay */}
      {show && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShow(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full  sm:w-[55vw] md:w-[35vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className=" px-6 py-4 flex items-center justify-between border ">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg border">
                <ShoppingCart className="h-5 w-5 text-black" />
              </div>
              <h2 className="text-xl font-semibold text-black">
                {editTable ? "Edit Sale" : "Add New Sale"}
              </h2>
            </div>
            <button
              onClick={() => setShow(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <BiX size={24} className="text-black" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Party Selection */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  Merchant *
                </label>
                <select
                  required
                  name="party"
                  value={values.party}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                >
                  <option value="">Select a Merchant</option>
                  {partiesData.map((party: any) => (
                    <option key={party?._id} value={party?._id}>
                      {party?.company_name?.length > 0
                        ? `Company Name - ${party.company_name}`
                        : `Merchant Name - ${party.consignee_name}`}
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
                  value={values.product_id}
                  onChange={(e) => {
                    const selectedProductId = e.target.value;
                    const selectedProduct = products.find(
                      (prod) => prod._id === selectedProductId
                    );
                    setFieldValue("product_id", selectedProductId);
                    if (selectedProduct?.uom) {
                      setFieldValue("uom", selectedProduct.uom);
                    } else {
                      setFieldValue("uom", "");
                    }
                  }}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
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
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Auto-filled from product selection"
                />
              </div>
              {/* </div> */}

              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
              {/* Product Image Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileImage className="h-4 w-4 text-gray-500" />
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    name="productFile"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setImagePreview(url);
                        setImageFile(file);
                        setFieldValue("productFile", file);
                      }
                    }}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-48 rounded-lg object-contain border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFieldValue("productFile", null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileImage className="h-4 w-4 text-gray-500" />
                  Drawing PDF
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    name="bompdf"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setBomFile(file);
                        setBomPreview(file.name);
                        setFieldValue("bompdf", file);
                      }
                    }}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {bomPreview && (
                    <div className="mt-4 flex items-center justify-between border px-3 py-2 rounded bg-gray-100 text-sm text-gray-700">
                      <span>{bomPreview}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBomFile(null);
                          setBomPreview(null);
                          setFieldValue("bompdf", null);
                        }}
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* </div> */}

              {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> */}
              {/* Price and Quantity Row */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <IndianRupee className="h-4 w-4 text-gray-500" />
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter quantity"
                  required
                />
                {touched.product_qty && errors.product_qty && (
                  <p className="text-red-500 text-sm">{errors.product_qty}</p>
                )}
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
                      className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        values.GST === String(rate)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
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
              {/* </div> */}

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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter terms of delivery..."
                />
              </div>

              {/* Remarks */}
              {/* <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Remarks
                </label>
                <textarea
                  name="comment"
                  value={values.comment}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Add any additional notes or comments..."
                />
              </div> */}
            </form>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShow(false)}
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
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {editTable ? "Updating..." : "Creating..."}
                  </div>
                ) : editTable ? (
                  "Update Sale"
                ) : (
                  "Create Sale"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewSale;
