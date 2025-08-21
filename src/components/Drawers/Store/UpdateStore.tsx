import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useUpdateStoreMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";
import { Store, MapPin, FileText, Hash, Edit3 } from "lucide-react";

interface UpdateStoreProps {
  storeId: string | undefined;
  fetchStoresHandler: () => void;
  closeDrawerHandler: () => void;
}

const UpdateStore: React.FC<UpdateStoreProps> = ({
  closeDrawerHandler,
  fetchStoresHandler,
  storeId,
}) => {
  const [cookies, setCookie] = useCookies();
  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(false);
  const [isUpdatingStore, setIsUpdatingStore] = useState<boolean>(false);
  const [name, setName] = useState<string | undefined>();
  const [gst, setGst] = useState<string | undefined>();
  const [addressLine1, setAddressLine1] = useState<string | undefined>();
  const [addressLine2, setAddressLine2] = useState<string | undefined>();
  const [pincode, setPincode] = useState<number | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();

  const [updateStore] = useUpdateStoreMutation();

  const updateStoreHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !addressLine1 ||
      !city ||
      !state ||
      name.trim().length === 0 ||
      addressLine1.trim().length === 0 ||
      city.trim().length === 0 ||
      state.trim().length === 0
    ) {
      toast.error("Please provide all the required fields");
      return;
    }
    try {
      setIsUpdatingStore(true);
      const response = await updateStore({
        _id: storeId,
        name: name,
        gst_number: gst,
        address_line1: addressLine1,
        address_line2: addressLine2,
        pincode: pincode,
        city: city,
        state: state,
      }).unwrap();
      toast.success(response.message);
      fetchStoresHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const fetchStoreDetailsHandler = async () => {
    try {
      setIsLoadingStore(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `store/${storeId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setName(data.store.name);
      setGst(data.store?.gst_number);
      setAddressLine1(data.store.address_line1);
      setAddressLine2(data.store?.address_line2);
      setPincode(data.store?.pincode);
      setCity(data.store.city);
      setState(data.store.state);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingStore(false);
    }
  };

  useEffect(() => {
    fetchStoreDetailsHandler();
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-[90vw] md:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className=" px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 border rounded-lg">
                <Edit3 className="h-5 w-5 text-black" />
              </div>
              <h2 className="text-xl font-semibold text-black">Update Store</h2>
            </div>
            <button
              onClick={closeDrawerHandler}
              className="p-2 hover:bg-white/20 border rounded-lg transition-colors duration-200"
            >
              <BiX size={24} className="text-black" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isLoadingStore ? (
              <div className="flex items-center justify-center h-64">
                <Loading />
              </div>
            ) : (
              <form onSubmit={updateStoreHandler} className="space-y-6">
                {/* Store Information Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    Store Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Store Name */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Store className="h-4 w-4 text-gray-500" />
                        Store Name *
                      </label>
                      <input
                        type="text"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter store name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        required
                      />
                    </div>

                    {/* GST Number */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 text-gray-500" />
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={gst || ""}
                        onChange={(e) => setGst(e.target.value)}
                        placeholder="Enter GST number"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Address Information
                  </h3>

                  <div className="space-y-6">
                    {/* Address Lines */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={addressLine1 || ""}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Enter address line 1"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={addressLine2 || ""}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Enter address line 2 (optional)"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      />
                    </div>

                    {/* Location Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Pincode */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Hash className="h-4 w-4 text-gray-500" />
                          Pincode
                        </label>
                        <input
                          type="number"
                          value={pincode || ""}
                          onChange={(e) => setPincode(+e.target.value)}
                          placeholder="Enter pincode"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          City *
                        </label>
                        <input
                          type="text"
                          value={city || ""}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter city"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                          required
                        />
                      </div>

                      {/* State */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          State *
                        </label>
                        <input
                          type="text"
                          value={state || ""}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Enter state"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeDrawerHandler}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStore}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isUpdatingStore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      "Update Store"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateStore;
