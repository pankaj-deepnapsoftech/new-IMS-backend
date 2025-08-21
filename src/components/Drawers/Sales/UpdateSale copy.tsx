// @ts-nocheck

import { get } from "http";
import { useEffect, useState } from "react";
import { Cookies, useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import axios from "axios";
import { toast } from "react-toastify";
import { GiConsoleController } from "react-icons/gi";

const UpdateSale = ({ editshow, seteditsale, sale }) => {
  const [cookies] = useCookies();
  const [formData, setFormData] = useState({
    party: "",
    product_id: "",
    price: "",
    product_qty: "",
    product_type: "finished goods",
    GST: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partiesData, setpartiesData] = useState([]);
  const [products, setProducts] = useState([]);

  const handleChange = (event) => {
    const { value } = event.target;
    setFormData((prevData) => ({ ...prevData, GST: value }));
  };

  useEffect(() => {
    if (sale) {
      setFormData({
        party: sale?.party_id?.[0]?._id || "",
        product_id: sale?.product_id?.[0]?._id || "",
        price: sale?.price || "",
        product_qty: sale?.product_qty || "",
        product_type: sale?.product_type || "finished goods",
        GST: sale?.GST || "",
        comment: sale?.comment || "",
      });
    }
  }, [sale]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}sale/update/${sale._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cookies.access_token}`,
          },
        }
      );

      setFormData({
        party: "",
        product_id: "",
        product_type: "finished goods",
        price: "",
        product_qty: "",
        GST: 0,
        comment: "",
      });

      toast.success("Sale created successfully");

      seteditsale(!editshow);
      // refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create the sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      console.log("testing data", error);
      toast.error("Failed to fetch data for dropdowns.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    fetchDropdownData();
  }, [cookies.access_token, toast]);
  return (
    <div
      className={`absolute z-50 top-0 ${
        editshow ? "right-1" : "hidden"
      }  w-[30vw] transition-opacity duration-500 h-full bg-[#57657F] text-white   justify-center`}
    >
      <div className=" p-6 rounded-lg w-full max-w-md relative">
        <BiX size="30px" onClick={() => seteditsale(!editshow)} />
        <h2 className="text-xl text-center mt-4 font-semibold py-3 px-4 bg-[#ffffff4f]  rounded-md text-white  mb-6  ">
          Edit Sale
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-md font-medium mb-2">Party </label>
            <select
              required
              name="party"
              value={formData.party}
              onChange={handleInputChange}
              className="w-full border border-gray-50 bg-[#47556913] focus:outline-none  text-gray-200 rounded px-2  py-2"
            >
              <option value="" className="text-black bg-[#ffffff41]">
                Select a party
              </option>
              {partiesData.map((parties: any) => (
                <option
                  className="text-black bg-[#ffffff41]"
                  key={parties?._id}
                  value={parties?._id}
                >
                  {parties?.full_name}{" "}
                  {parties?.company_name ? ` - ${parties?.company_name}` : null}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-md font-medium">Product</label>
            <select
              required
              name="product_id"
              value={formData?.product_id}
              onChange={handleInputChange}
              className="w-full border border-gray-50 bg-[#47556913] focus:outline-none  text-gray-200 rounded px-2  py-2"
            >
              <option value="" className="text-black bg-[#ffffff41]">
                Select a product
              </option>
              {products.map((product: any) => (
                <option
                  className="text-black bg-[#ffffff41]"
                  key={product?._id}
                  value={product?._id}
                >
                  {product?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-md font-medium">Price </label>
            <input
              type="number"
              name="price"
              value={formData?.price}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 bg-[#47556913] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Product Quantity{" "}
            </label>
            <input
              type="number"
              name="product_qty"
              value={formData?.product_qty}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 bg-[#47556913] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">GST Type</label>
            <div className="flex space-x-4 mt-1">
              <label>
                <input
                  type="radio"
                  name="gst"
                  value="18"
                  onChange={handleChange}
                />{" "}
                GST (18%)
              </label>
              <label>
                <input
                  type="radio"
                  name="gst"
                  value="12"
                  onChange={handleChange}
                />{" "}
                GST (12%)
              </label>
              <label>
                <input
                  type="radio"
                  name="gst"
                  value="5"
                  onChange={handleChange}
                />{" "}
                GST (5%)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Remarks</label>
            <input
              type="text"
              name="remarks"
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 bg-[#47556913] focus:outline-none"
              placeholder="Further Details (if any)"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-[#ffffff41] text-white px-4 py-2 rounded hover:"
              disabled={isSubmitting}
            >
              Update Sale
            </button>
            <button
              type="button"
              onClick={() => seteditsale(!editshow)}
              className=" bg-[#ffffff41] px-4 py-2 rounded  hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSale;
