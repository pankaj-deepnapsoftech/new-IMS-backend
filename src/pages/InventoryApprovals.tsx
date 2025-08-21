//@ts-nocheck


import { MdOutlineRefresh } from "react-icons/md";
import { FiSearch, FiCheckSquare, FiPackage } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import BOMRawMaterialTable from "../components/Table/BOMRawMaterialTable";
import { colors } from "../theme/colors";
import FinishedGoodsTable from "../components/Table/FinishGoodsApprovalTable";

// Lightweight Finished Goods table right here so you don't need an external component
// Swap this with your own component if you already have one.




const InventoryApprovals: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("inventory");
  const [isApproved, setIsApproved] = useState(false);
  const [cookies] = useCookies();
  const token = cookies?.access_token;

  // Search
  const [searchKey, setSearchKey] = useState<string | undefined>("");

  // Tabs
  type Tab = "" | "raw" | "fg"; // "" = nothing shown until user clicks
  const [activeTab, setActiveTab] = useState<Tab>("raw");

  // RAW MATERIALS state
  const [rmData, setRmData] = useState<any[]>([]);
  const [rmFiltered, setRmFiltered] = useState<any[]>([]);
  const [isLoadingRM, setIsLoadingRM] = useState<boolean>(false);

  // FINISHED GOODS state
  const [fgData, setFgData] = useState<any[]>([]);
  const [fgFiltered, setFgFiltered] = useState<any[]>([]);
  const [isLoadingFG, setIsLoadingFG] = useState<boolean>(false);

  const fetchRM = async () => {
    try {
      setIsLoadingRM(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "bom/all/inventory/raw-materials",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const results = await response.json();
      if (!results?.success) throw new Error(results?.message || "Failed to load raw materials");
      setRmData(results.unapproved || []);
      setRmFiltered(results.unapproved || []);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong loading Raw Materials");
    } finally {
      setIsLoadingRM(false);
    }
  };

  const approveRM = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}bom/approve/inventory/raw-materials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: id }),
        }
      );
      window.location.reload()
      setIsApproved(true)
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success("Raw material approved successfully!");

      if (!data?.success) throw new Error(data?.message || "Approval failed");
      toast.success("Raw material approved successfully!");
      // Optimistically remove from list
      setRmData((prev) => prev.filter((x: any) => x?._id !== id));
      setRmFiltered((prev) => prev.filter((x: any) => x?._id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const fetchFG = async () => {
    try {
      setIsLoadingFG(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "production-process/moved-to-inventory",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const results = await response.json();
      if (!results?.success) throw new Error(results?.message || "Failed to load finished goods");
      // Accept either `unapproved` or a plain array depending on backend
      const items = results.unapproved || results.data || results.items || [];
      setFgData(items);
      setFgFiltered(items);

    } catch (err: any) {
      toast.error(err?.message || "Something went wrong loading Finished Goods");
    } finally {
      setIsLoadingFG(false);
    }
  };

  const approveFG = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}production-process/update-inventory-status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ processId: id, status: "allocated finish goods" }), // fixed
        }
      );
      window.location.reload()
      const data = await response.json();
      if (!data?.success) throw new Error(data?.message || "Approval failed");

      toast.success(data.message || "Status updated to allocated");
      setFgData((prev) => prev.filter((x: any) => x?._id !== id));
      setFgFiltered((prev) => prev.filter((x: any) => x?._id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };



  // When user changes tab, lazy-load data for that tab
  useEffect(() => {
    if (!token) return;
    if (activeTab === "raw" && rmData.length === 0) fetchRM();
    if (activeTab === "fg" && fgData.length === 0) fetchFG();
  }, [activeTab, token]);

  // Search across whichever tab is open
  useEffect(() => {
    const q = (searchKey || "").toLowerCase().trim();
    if (activeTab === "raw") {
      if (!q) return setRmFiltered(rmData);
      const res = rmData.filter((emp: any) => {
        const firstName = emp.first_name?.toString().toLowerCase() || "";
        const lastName = emp.last_name?.toString().toLowerCase() || "";
        const email = emp.email?.toString().toLowerCase() || "";
        const phone = emp.phone?.toString() || "";
        const role = emp?.role?.role?.toString().toLowerCase() || "";
        const createdAt = emp?.createdAt
          ? new Date(emp.createdAt).toISOString().substring(0, 10).split("-").reverse().join("")
          : "";
        const updatedAt = emp?.updatedAt
          ? new Date(emp.updatedAt).toISOString().substring(0, 10).split("-").reverse().join("")
          : "";
        return (
          firstName.includes(q) ||
          lastName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          role.includes(q) ||
          createdAt.includes(q.replaceAll("/", "")) ||
          updatedAt.includes(q.replaceAll("/", ""))
        );
      });
      setRmFiltered(res);
    } else if (activeTab === "fg") {
      if (!q) return setFgFiltered(fgData);
      const res = fgData.filter((row: any) => {
        const name = row?.name?.toString().toLowerCase() || row?.product_name?.toString().toLowerCase() || "";
        const sku = row?.sku?.toString().toLowerCase() || row?.code?.toString().toLowerCase() || "";
        const requestedBy = row?.requestedBy?.name?.toLowerCase?.() || row?.createdBy?.name?.toLowerCase?.() || "";
        const createdAt = row?.createdAt
          ? new Date(row.createdAt).toISOString().substring(0, 10).split("-").reverse().join("")
          : "";
        return (
          name.includes(q) || sku.includes(q) || requestedBy.includes(q) || createdAt.includes(q.replaceAll("/", ""))
        );
      });
      setFgFiltered(res);
    }
  }, [searchKey, activeTab, rmData, fgData]);

  if (!isAllowed) {
    return (
      <div className="text-center text-red-500">You are not allowed to access this route.</div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.page }}>
      <div className="p-2 lg:p-3">
        {/* Header Section */}
        <div
          className="rounded-xl shadow-sm border p-6 mb-6"
          style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <FiCheckSquare className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text.primary }}>
                  Inventory Approvals
                </h1>
                <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                  Review and approve BOM items
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {activeTab && (
                <button
                  onClick={() => (activeTab === "raw" ? fetchRM() : fetchFG())}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg border transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.medium,
                    color: colors.text.secondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.gray[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.card;
                  }}
                >
                  <MdOutlineRefresh size={16} />
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* Top row: Toggle Buttons + Search */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4 items-end">
            {/* Toggle Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setActiveTab("raw")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all"
                style={{
                  backgroundColor: activeTab === "raw" ? colors.primary[50] : colors.background.card,
                  borderColor: activeTab === "raw" ? colors.primary[300] : colors.border.medium,
                  color: activeTab === "raw" ? colors.primary[800] : colors.text.secondary,
                }}
              >
                <FiPackage />
                BOM Raw Material
              </button>

              <button
                onClick={() => setActiveTab("fg")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all"
                style={{
                  backgroundColor: activeTab === "fg" ? colors.primary[50] : colors.background.card,
                  borderColor: activeTab === "fg" ? colors.primary[300] : colors.border.medium,
                  color: activeTab === "fg" ? colors.primary[800] : colors.text.secondary,
                }}
              >
                <FiCheckSquare />
                Finished Goods Approval
              </button>
            </div>

            {/* Search Input */}
            {activeTab && (
              <div className="flex-1 max-w-md ml-auto">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Search {activeTab === "raw" ? "Raw Materials" : "Finished Goods"}
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.text.secondary }} size={16} />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === "raw" ? "raw materials" : "finished goods"}...`}
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = colors.input.borderFocus;
                      (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = colors.input.border;
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Section (hidden until a button is clicked) */}
        {activeTab && (
          <div
            className="rounded-xl shadow-sm border overflow-hidden"
            style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}
          >
            {activeTab === "raw" ? (
              <BOMRawMaterialTable
                products={rmFiltered}
                isLoadingProducts={isLoadingRM}
                approveProductHandler={approveRM}
                isApproved={isApproved}
              />
            ) : (
              <FinishedGoodsTable
                items={fgFiltered}
                isLoading={isLoadingFG}
                onApprove={approveFG}
              />

            )}
          </div>
        )}

        {/* Empty state hint BEFORE clicking a tab */}
        {!activeTab && (
          <div
            className="rounded-xl shadow-sm border p-8 text-center"
            style={{ backgroundColor: colors.background.card, borderColor: colors.border.light }}
          >
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Choose a section above to view approvals: <strong>BOM Raw Material</strong> or <strong>Finished Goods Approval</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryApprovals;
