import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import PaymentTable from "../components/Table/PaymentTable";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { MdOutlineRefresh } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  closePaymentDetailsDrawer,
  closeUpdatePaymentDrawer,
  openPaymentDetailsDrawer,
  openUpdatePaymentDrawer,
} from "../redux/reducers/drawersSlice";
import PaymentDetails from "../components/Drawers/Payment/PaymentDetails";
import UpdatePayment from "../components/Drawers/Payment/UpdatePayment";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import { BadgeIndianRupee } from "lucide-react";

const Payment: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("sale & purchase");
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [data, setData] = useState<any[] | []>([]);
  const [filteredData, setFilteredData] = useState<any[] | []>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(false);
  const [cookies] = useCookies();
  const dispatch = useDispatch();
  const { isUpdatePaymentDrawerOpened, isPaymentDetailsDrawerOpened } =
    useSelector((state: any) => state.drawers);
  const [id, setId] = useState<string | undefined>();

  const fetchPaymentsHandler = async () => {
    try {
      setIsLoadingPayments(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "payment/all",
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
      setData(data.payments);
      setFilteredData(data.payments);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const openPaymentDetailsDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openPaymentDetailsDrawer());
  };
  const closePaymentDetailsDrawerHandler = (id: string) => {
    setId(id);
    dispatch(closePaymentDetailsDrawer());
  };

  const openPaymentUpdateDrawerHandler = (id: string) => {
    setId(id);
    dispatch(openUpdatePaymentDrawer());
  };
  const closePaymentUpdateDrawerHandler = () => {
    setId(id);
    dispatch(closeUpdatePaymentDrawer());
  };

  useEffect(() => {
    fetchPaymentsHandler();
  }, []);

  useEffect(() => {
    const searchText = searchKey?.toLowerCase();
    const results = data.filter(
      (p: any) =>
        p.creator.first_name?.toLowerCase()?.includes(searchText) ||
        p?.creator?.last_name?.toLowerCase()?.includes(searchText) ||
        p?.amount?.toString()?.toLowerCase()?.includes(searchText) ||
        p?.mode?.toLowerCase()?.includes(searchText) ||
        p?.supplier?.name?.toLowerCase()?.includes(searchText) ||
        p?.buyer?.name?.toLowerCase()?.includes(searchText) ||
        (p?.createdAt &&
          new Date(p?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchText?.replaceAll("/", "") || "")) ||
        (p?.updatedAt &&
          new Date(p?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchText?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey])

  if (!isAllowed) {
    return <div className="text-center text-red-500">You are not allowed to access this route.</div>
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      {isPaymentDetailsDrawerOpened && (
        <PaymentDetails
          closeDrawerHandler={closePaymentDetailsDrawerHandler}
          id={id}
        />
      )}
      {isUpdatePaymentDrawerOpened && (
        <UpdatePayment
          closeDrawerHandler={closePaymentUpdateDrawerHandler}
          id={id}
          fetchPaymentsHandler={fetchPaymentsHandler}
        />
      )}

      {/* <div className="w-full">
        <h1 className="text-[28px] md:text-[35px] text-center text-white pb-4 font-bold">
          Payments
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 px-4 md:px-10 w-full mt-2">

          <div className="relative w-full md:w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
            <input
              className="pl-10 pr-4 py-2 w-full text-sm text-gray-200 border-b bg-[#475569] shadow-sm focus:outline-none placeholder:text-gray-200"
              placeholder="Search roles..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>

          <button
            onClick={fetchPaymentsHandler}
            className="text-white border border-white hover:bg-[#2D3748] hover:text-white text-sm rounded-[6px] px-4 py-2 w-full md:w-[100px] transition-all flex items-center justify-center gap-1"
          >
            <MdOutlineRefresh className="text-base" />
            Refresh
          </button>
        </div>
      </div> */}

      <div className="p-2 lg:p-3">
        {/* Header */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <BadgeIndianRupee color="white" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Payments
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track all your payments efficiently.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={fetchPaymentsHandler}
                leftIcon={<MdOutlineRefresh />}
                variant="outline"
                colorScheme="gray"
                size="md"
                className="border-gray-300 hover:border-gray-400 transition-all duration-200"
                _hover={{ bg: "gray.50", transform: "translateY(-1px)" }}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Search Section */}
          <div className="mt-4 flex justify-center sm:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                placeholder="Search roles..."
                value={searchKey || ""}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <PaymentTable
            isLoadingPayments={isLoadingPayments}
            payments={filteredData}
            payment={filteredData}
            openPaymentDetailsDrawerHandler={openPaymentDetailsDrawerHandler}
            openUpdatePaymentDrawer={openPaymentUpdateDrawerHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;
