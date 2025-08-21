//@ts-nocheck

import { Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { MdOutlineRefresh, MdAdd } from "react-icons/md";
import BOMTable from "../components/Table/BOMTable";
import { useDeleteBomMutation, useLazyFetchBomsQuery } from "../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddBomDrawer,
  closeBomDetailsDrawer,
  closeUpdateBomDrawer,
  openAddBomDrawer,
  openBomDetailsDrawer,
  openUpdateBomDrawer,
} from "../redux/reducers/drawersSlice";
import AddBom from "../components/Drawers/BOM/AddBom";
import BomDetails from "../components/Drawers/BOM/BomDetails";
import UpdateBom from "../components/Drawers/BOM/UpdateBom";
import { FiDownload, FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import { FileText } from "lucide-react";
import { AiFillFileExcel } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import SampleCSV from "../assets/csv/bom-sample.csv";
import * as XLSX from "xlsx";

const BOM: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  // console.log("allowedroutes =", allowedroutes);
  const isAllowed = isSuper || allowedroutes.includes("production");
  const [cookies] = useCookies();
  const [bomId, setBomId] = useState<string | undefined>();
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [isLoadingBoms, setIsLoadingBoms] = useState<boolean>(false);
  const [boms, setBoms] = useState<any[]>([]);
  const [filteredBoms, setFilteredBoms] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // const [showBulkUploadMenu, setShowBulkUploadMenu] = useState(false);fhjffryj
  const [deleteBom] = useDeleteBomMutation();
  // const [bulkUploading, setBulkUploading] = useState(false);
  // const fileRef = useRef<HTMLInputElement | null>(null);
  const {
    isAddBomDrawerOpened,
    isUpdateBomDrawerOpened,
    isBomDetailsDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const openAddBomDrawerHandler = () => {
    dispatch(openAddBomDrawer());
  };
  const closeAddBomDrawerHandler = () => {
    dispatch(closeAddBomDrawer());
  };
  const openUpdateBomDrawerHandler = (id: string) => {
    setBomId(id);
    dispatch(openUpdateBomDrawer());
  };
  const closeUpdateBomDrawerHandler = () => {
    dispatch(closeUpdateBomDrawer());
  };
  const openBomDetailsDrawerHandler = (id: string) => {
    setBomId(id);
    dispatch(openBomDetailsDrawer());
  };
  const closeBomDetailsDrawerHandler = () => {
    dispatch(closeBomDetailsDrawer());
  };

  const fetchBomsHandler = async () => {
    try {
      setIsLoadingBoms(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "bom/all",
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
      setBoms(data?.boms);
      setFilteredBoms(data.boms);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingBoms(false);
    }
  };

  const deleteBomHandler = async (id: string) => {
    try {
      const response = await deleteBom(id).unwrap();
      toast.success(response?.message);
      fetchBomsHandler();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };
  console.log(boms);
  const exportProductsToExcel = async () => {
    try {
      setIsExporting(true);

      if (!boms || boms.length === 0) {
        toast.warning("No BOMs to export");
        return;
      }

      const dataForExcel = boms.map((bom: any, index: number) => {
        const rawMaterialNames = bom?.raw_materials
          ?.map((mat: any) => mat?.item?.name || "N/A")
          .join(", ");

        const rawMaterialQuantities = bom?.raw_materials
          ?.map((mat: any) => mat?.quantity || 0)
          .join(", ");

        const scrapMaterialNames = bom?.scrap_materials
          ?.map((scrap: any) => scrap?.item?.name || "N/A")
          .join(", ");

        const labourCharges = bom?.other_charges?.labour_charges || 0;
        const machineryCharges = bom?.other_charges?.machinery_charges || 0;
        const electricityCharges = bom?.other_charges?.electricity_charges || 0;
        const otherCharges = bom?.other_charges?.other_charges || 0;

        return {
          "Sr. No.": index + 1,
          "Created At": bom?.createdAt
            ? new Date(bom?.createdAt).toLocaleDateString()
            : "N/A",
          "BOM Name": bom?.bom_name || "N/A",
          "Parts Count": bom?.parts_count || 0,
          "Total Cost": bom?.total_cost || 0,
          "Finish Goods Item Name": bom?.finished_good?.item?.name || "N/A",
          "F Item Quantity": bom?.finished_good?.quantity || 0,
          "Raw Materials Items Name": rawMaterialNames || "N/A",
          "R Item Quantity": rawMaterialQuantities || "0",
          "Scrap Materials": scrapMaterialNames || "N/A",
          "Labour Charges": labourCharges,
          "Machinery Charges": machineryCharges,
          "Electricity Charges": electricityCharges,
          "Other Charges": otherCharges,
          "Updated At": bom?.updatedAt
            ? new Date(bom?.updatedAt).toLocaleDateString()
            : "N/A",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BOM Products");

      worksheet["!cols"] = [
        { wch: 8 }, // Sr. No.
        { wch: 20 }, // Created At
        { wch: 25 }, // BOM Name
        { wch: 12 }, // Parts Count
        { wch: 12 }, // Total Cost
        { wch: 25 }, // Finish Goods Item Name
        { wch: 12 }, // F Item Quantity
        { wch: 30 }, // Raw Materials Items Name
        { wch: 20 }, // R Item Quantity
        { wch: 25 }, // Scrap Materials
        { wch: 18 }, // Labour Charges
        { wch: 20 }, // Machinery Charges
        { wch: 20 }, // Electricity Charges
        { wch: 18 }, // Other Charges
        { wch: 20 }, // Updated At
      ];

      const fileName = `BOM_Export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Error exporting BOMs:", err);
      toast.error("Error exporting BOMs");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchBomsHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = boms.filter(
      (bom: any) =>
        bom._id?.toLowerCase()?.includes(searchTxt) ||
        bom.bom_name?.toLowerCase()?.includes(searchTxt) ||
        bom.parts_count?.toString()?.toLowerCase()?.includes(searchTxt) ||
        bom.total_cost?.toString()?.toLowerCase()?.includes(searchTxt) ||
        (bom?.approved_by?.first_name + " " + bom?.approved_by?.last_name)
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTxt || "") ||
        (bom?.createdAt &&
          new Date(bom?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (bom?.updatedAt &&
          new Date(bom?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredBoms(results);
  }, [searchKey]);

  if (!isAllowed) {
    return (
      <div className="text-center text-red-500">
        You are not allowed to access this route.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="p-2 lg:p-3">
        {/* Add BOM */}
        {isAddBomDrawerOpened && (
          <AddBom
            closeDrawerHandler={closeAddBomDrawerHandler}
            fetchBomsHandler={fetchBomsHandler}
          />
        )}
        {/* BOM Details */}
        {isBomDetailsDrawerOpened && (
          <BomDetails
            bomId={bomId}
            closeDrawerHandler={closeBomDetailsDrawerHandler}
          />
        )}
        {/* Update BOM */}
        {isUpdateBomDrawerOpened && (
          <UpdateBom
            bomId={bomId}
            closeDrawerHandler={closeUpdateBomDrawerHandler}
            fetchBomsHandler={fetchBomsHandler}
          />
        )}

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
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Bill Of Materials (BOM)
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage bill of materials and production specifications
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openAddBomDrawerHandler}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: colors.button.primary,
                  color: colors.text.inverse,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.button.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button.primary;
                }}
              >
                <MdAdd size="20px" />
                Add BOM
              </button>

              <button
                onClick={exportProductsToExcel}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.success[600],
                  color: colors.text.inverse,
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.backgroundColor = colors.success[700];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.backgroundColor = colors.success[600];
                  }
                }}
              >
                <FiDownload size={16} />
                {isExporting ? "Exporting..." : "Export to Excel"}
              </button>
              <button
                onClick={fetchBomsHandler}
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
                <MdOutlineRefresh size="20px" />
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
                Search BOMs
              </label>
              <div className="relative">
                <FiSearch
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
                  placeholder="Search by BOM ID, name, parts, cost..."
                  value={searchKey || ""}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOM Table */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <BOMTable
            isLoadingBoms={isLoadingBoms}
            boms={filteredBoms}
            openBomDetailsDrawerHandler={openBomDetailsDrawerHandler}
            openUpdateBomDrawerHandler={openUpdateBomDrawerHandler}
            deleteBomHandler={deleteBomHandler}
            refreshBoms={fetchBomsHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default BOM;
