// @ts-nocheck

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import axios from "axios";
import { useCookies } from "react-cookie";
import { PartiesFromValidation } from "../../../Validation/PartiesFromValidation";
import { colors } from "../../../theme/colors";
import {
  Users,
  Building2,
  User,
  MapPin,
  FileText,
  Mail,
  Phone,
  Plus,
  Edit3,
  UserPlus,
} from "lucide-react";
import { RiContactsBook2Fill } from "react-icons/ri";

const AddParties = ({
  showData,
  setshowData,
  setCounter,
  edittable,
  setEditTable,
  fetchPartiesData,
}) => {
  const [consigneeNames, setConsigneeNames] = useState([""]);
  const [contactNumbers, setContactNumbers] = useState([""]);
  const [emailIds, setEmailIds] = useState([""]);
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  useEffect(() => {
    if (edittable) {
      setConsigneeNames(edittable.consignee_name || [""]);
      setContactNumbers(edittable.contact_number || [""]);
      setEmailIds(edittable.email_id || [""]);
    } else {
      setConsigneeNames([""]);
      setContactNumbers([""]);
      setEmailIds([""]);
    }
  }, [edittable]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      type: edittable?.type || "",
      parties_type: edittable?.parties_type || "",
      shipped_to: edittable?.shipped_to || "",
      bill_to: edittable?.bill_to || "",
      shipped_gst_to: edittable?.shipped_gst_to || "",
      bill_gst_to: edittable?.bill_gst_to || "",
      company_name: edittable?.company_name || "",
      contact_person_name: edittable?.contact_person_name,
    },
    validationSchema: PartiesFromValidation,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      console.log("Submitting values:", values);

      const payload = {
        ...values,
        consignee_name: values.type === "Individual" ? consigneeNames : [],
        contact_number: contactNumbers,
        email_id: emailIds,
      };

      try {
        let res;

        if (edittable?._id) {
          res = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}parties/put/${edittable._id}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
        } else {
          res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}parties/create`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
        }

        toast.success(res?.data?.message);
        fetchPartiesData();
        formik.resetForm();
        setConsigneeNames([""]);
        setContactNumbers([""]);
        setEmailIds([""]);
        setshowData(false);
        setEditTable(null);
      } catch (error) {
        console.error(error);
        toast.error(error?.message || "Something went wrong!");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const renderFieldList = (
    label,
    values,
    setValues,
    icon,
    { allowAdd = true } = {}
  ) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </label>

      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValues = [...values];
              newValues[index] = e.target.value;
              setValues(newValues);
            }}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const newValues = values.filter((_, i) => i !== index);
                setValues(newValues.length > 0 ? newValues : [""]);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <BiX size={20} />
            </button>
          )}
        </div>
      ))}

      {allowAdd && (
        <button
          type="button"
          onClick={() => setValues([...values, ""])}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          Add More {label}
        </button>
      )}
    </div>
  );

  useEffect(() => {
    if (checkboxValue) {
      formik.setFieldValue("bill_to", formik.values.shipped_to || "");
      formik.setFieldValue("bill_gst_to", formik.values.shipped_gst_to || "");
    }
  }, [formik.values.shipped_to, formik.values.shipped_gst_to, checkboxValue]);

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          showData ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg border">
                {edittable ? (
                  <Edit3 className="h-5 w-5 text-black" />
                ) : (
                  <UserPlus className="h-5 w-5 text-black" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-black">
                {edittable ? "Update Merchant" : "Add New Merchant"}
              </h2>
            </div>
            <button
              onClick={() => setshowData(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 border"
            >
              <BiX size={24} className="text-black" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4 text-gray-500" />
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formik.values.type}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        formik.setFieldValue("type", selectedType);

                        if (selectedType === "Individual") {
                          formik.setFieldValue("company_name", "");
                        } else if (selectedType === "Company") {
                          setConsigneeNames([""]);
                        }
                      }}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    >
                      <option value="">Select type</option>
                      <option value="Individual">Individual</option>
                      <option value="Company">Company</option>
                    </select>
                    {formik.touched.type && formik.errors.type && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        {formik.errors.type}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4 text-gray-500" />
                      Merchant Type *
                    </label>
                    <select
                      name="parties_type"
                      value={formik.values.parties_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    >
                      <option value="">Select merchant type</option>
                      <option value="Buyer">Buyer</option>
                      <option value="Seller">Seller</option>
                    </select>
                    {formik.touched.parties_type &&
                      formik.errors.parties_type && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          {formik.errors.parties_type}
                        </p>
                      )}
                  </div>

                  {formik.values.type === "Company" && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formik.values.company_name || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter company name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      />
                      {formik.touched.company_name &&
                        formik.errors.company_name && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            {formik.errors.company_name}
                          </p>
                        )}
                    </div>
                  )}
                  {formik.values.type === "Company" && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <RiContactsBook2Fill className="h-4 w-4 text-gray-500" />
                        Contact Person Name
                      </label>
                      <input
                        type="text"
                        name="contact_person_name"
                        value={formik.values.contact_person_name || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter company name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      />
                    </div>
                  )}
                  {formik.values.type === "Individual" && (
                    <div className="space-y-2 md:col-span-2">
                      {renderFieldList(
                        "Consignee Name",
                        consigneeNames,
                        setConsigneeNames,
                        <User className="h-4 w-4 text-gray-500" />,
                        { allowAdd: false }
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    {renderFieldList(
                      "Contact Number",
                      contactNumbers,
                      setContactNumbers,
                      <Phone className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  <div className="space-y-6">
                    {renderFieldList(
                      "Email ID",
                      emailIds,
                      setEmailIds,
                      <Mail className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Shipped To
                    </label>
                    <input
                      type="text"
                      name="shipped_to"
                      value={formik.values.shipped_to}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter shipping address"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    />
                    {formik.touched.shipped_to && formik.errors.shipped_to && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        {formik.errors.shipped_to}
                      </p>
                    )}
                  </div>
                  {formik.values.type === "Company" && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Shipped GSTIN
                      </label>
                      <input
                        type="text"
                        name="shipped_gst_to"
                        value={formik.values.shipped_gst_to}
                        onChange={(e) => {
                          const uppercase = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "");
                          formik.setFieldValue(
                            "shipped_gst_to",
                            uppercase.slice(0, 15)
                          );
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="Enter Shipped GSTIN"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      />
                      {formik.touched.shipped_gst_to &&
                        formik.errors.shipped_gst_to && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            {formik.errors.shipped_gst_to}
                          </p>
                        )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Bill To
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sameAsShipped"
                          checked={checkboxValue}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCheckboxValue(checked);
                            if (checked) {
                              formik.setFieldValue(
                                "bill_to",
                                formik.values.shipped_to || ""
                              );
                              formik.setFieldValue(
                                "bill_gst_to",
                                formik.values.shipped_gst_to || ""
                              );
                            } else {
                              formik.setFieldValue("bill_to", "");
                              formik.setFieldValue("bill_gst_to", "");
                            }
                          }}
                        />
                        <label
                          htmlFor="sameAsShipped"
                          className="text-sm text-gray-700"
                        >
                          Same as Shipped To
                        </label>
                      </div>
                    </div>

                    <input
                      type="text"
                      name="bill_to"
                      value={formik.values.bill_to}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter billing address"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    />

                    {formik.touched.bill_to && formik.errors.bill_to && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        {formik.errors.bill_to}
                      </p>
                    )}
                  </div>

                  {formik.values.type === "Company" && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Bill GSTIN
                      </label>
                      <input
                        type="text"
                        name="bill_gst_to"
                        value={formik.values.bill_gst_to}
                        onChange={(e) => {
                          const uppercase = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "");
                          formik.setFieldValue(
                            "bill_gst_to",
                            uppercase.slice(0, 15)
                          );
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="Enter Bill GSTIN"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      />
                      {formik.touched.bill_gst_to &&
                        formik.errors.bill_gst_to && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            {formik.errors.bill_gst_to}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>

              <div className=" w-full bg-white px-4 py-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setshowData(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {edittable ? "Updating..." : "Creating..."}
                    </>
                  ) : edittable ? (
                    "Update Merchant"
                  ) : (
                    "Create Merchant"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddParties;
