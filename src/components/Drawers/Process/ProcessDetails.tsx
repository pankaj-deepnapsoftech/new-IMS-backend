import { toast } from "react-toastify";
import Drawer from "../../../ui/Drawer";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import Loading from "../../../ui/Loading";
import { BiX } from "react-icons/bi";
import moment from "moment";
import { colors } from "../../../theme/colors";
import {
  Settings,
  FileText,
  Hash,
  User,
  Eye,
} from "lucide-react";

interface ProcessProps {
  closeDrawerHandler: () => void;
  id: string | undefined;
}

const ProcessDetails: React.FC<ProcessProps> = ({ closeDrawerHandler, id }) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [process, setProcess] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [creator, setCreator] = useState<any | undefined>();

  const fetchProcessDetails = async (id: string) => {
    try {
      // @ts-ignore
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `process/${id}`,
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
      setProcess(data.process.process);
      setDescription(data.process?.description);
      setDescription(data.process.creator);
    } catch (error: any) {
      toast.error(error.messsage || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchProcessDetails(id || "");
  }, [id]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full  bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Production Process Details</h2>
            </div>
            <button
              onClick={closeDrawerHandler}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <BiX size={24} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loading />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Process Details Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Process Information
                  </h3>

                  <div className="space-y-6">
                    {/* Created By */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Created By</h4>
                        <p className="text-gray-900 font-medium">
                          {creator?.first_name + " " + creator?.last_name || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Process */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Settings className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Process</h4>
                        <p className="text-gray-900 font-medium">
                          {process || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-gray-900">
                          {description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    Additional Information
                  </h3>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      This process contains the detailed steps and requirements for production operations.
                    </p>
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

export default ProcessDetails;
