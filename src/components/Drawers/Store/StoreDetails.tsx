import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../../ui/Loading";
import Drawer from "../../../ui/Drawer";
import { colors } from "../../../theme/colors";
import { Store, MapPin, FileText, Hash, Eye } from "lucide-react";

interface StoreDetailsProps {
  closeDrawerHandler: () => void;
  storeId: string | undefined;
}

const StoreDetails: React.FC<StoreDetailsProps> = ({
  closeDrawerHandler,
  storeId,
}) => {
  const [cookies] = useCookies();
  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(false);
  const [name, setName] = useState<string | undefined>();
  const [gst, setGst] = useState<string | undefined>();
  const [addressLine1, setAddressLine1] = useState<string | undefined>();
  const [addressLine2, setAddressLine2] = useState<string | undefined>();
  const [pincode, setPincode] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();

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
      setGst(data.store?.gst_number || "N/A");
      setAddressLine1(data.store.address_line1);
      setAddressLine2(data.store?.address_line2 || "N/A");
      setPincode(data.store?.pincode || "N/A");
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
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 border rounded-lg">
                <Eye className="h-5 w-5 text-black" />
              </div>
              <h2 className="text-xl font-semibold text-black">
                Store Details
              </h2>
            </div>
            <button
              onClick={closeDrawerHandler}
              className="p-2 hover:bg-white/20 border rounded-lg transition-colors duration-200"
            >
              <BiX size={24} className="text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isLoadingStore ? (
              <div className="flex items-center justify-center h-64">
                <Loading />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Store Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    Store Information
                  </h3>

                  <div className="space-y-6">
                    {/* Store Name */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Store className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Store Name
                        </h4>
                        <p className="text-gray-900 font-medium">
                          {name || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* GST Number */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          GST Number
                        </h4>
                        <p className="text-gray-900 font-medium">
                          {gst || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Address Information
                  </h3>

                  <div className="space-y-6">
                    {/* Address Line 1 */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Address Line 1
                        </h4>
                        <p className="text-gray-900">{addressLine1 || "N/A"}</p>
                      </div>
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </h4>
                        <p className="text-gray-900">{addressLine2 || "N/A"}</p>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pincode */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Hash className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Pincode
                          </h4>
                          <p className="text-gray-900 font-medium">
                            {pincode || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* City */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            City
                          </h4>
                          <p className="text-gray-900 font-medium">
                            {city || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* State */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            State
                          </h4>
                          <p className="text-gray-900 font-medium">
                            {state || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreDetails;
