//@ts-nocheck
import React from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useCookies } from "react-cookie";

const colors = {
  border: { light: "#e5e7eb" },
  text: { primary: "#111827", secondary: "#6b7280" },
  primary: { 50: "#eff6ff", 200: "#bfdbfe", 700: "#1d4ed8" },
};
const getStatusStyle = (status) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-200 text-gray-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "error":
    case "failed":
      return "bg-red-100 text-red-800";
    case "on hold":
    case "on_hold":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-blue-100 text-blue-800"; // fallback
  }
};

// API call for Receive by Inventory

const FinishedGoodsTable = ({
  items,
  isLoading,
  fetchFinishedGoods,
  onApprove,
}) => {
  const [cookies] = useCookies();

  const receiveByInventory = async (id) => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "";

      const res = await axios.post(
        `${baseURL}production-process/receive-by-inventory`,
        { id: id },
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.location.reload()  
      toast.success(res.data.message || "Goods received by inventory!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error receiving goods");
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: colors.border.light }}>
            <th
              className="text-left p-3"
              style={{ color: colors.text.secondary }}
            >
              #
            </th>
            <th
              className="text-left p-3"
              style={{ color: colors.text.secondary }}
            >
              Product
            </th>
            <th
              className="text-left p-3"
              style={{ color: colors.text.secondary }}
            >
              Product ID
            </th>
            <th
              className="text-left p-3"
              style={{ color: colors.text.secondary }}
            >
              Produced Qty
            </th>
            <th
              className="text-left p-3"
              style={{ color: colors.text.secondary }}
            >
              Status
            </th>
            <th
              className="text-left p-3"
              style={{ color: colors.text.secondary }}
            >
              Created
            </th>
            <th
              className="text-right p-3"
              style={{ color: colors.text.secondary }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={7}
                className="p-6 text-center"
                style={{ color: colors.text.secondary }}
              >
                Loading finished goods...
              </td>
            </tr>
          ) : items?.length ? (
            items.map((row, idx) => (
              <tr
                key={row?._id || idx}
                className="border-b"
                style={{ borderColor: colors.border.light }}
              >
                <td className="p-3" style={{ color: colors.text.primary }}>
                  {idx + 1}
                </td>
                <td className="p-3" style={{ color: colors.text.primary }}>
                  {row?.finished_good?.item?.name || "—"}
                </td>
                <td className="p-3" style={{ color: colors.text.primary }}>
                  {row?.finished_good?.item?.product_id || "—"}
                </td>
                <td className="p-3" style={{ color: colors.text.primary }}>
                  {row?.finished_good?.produced_quantity || 0}
                </td>
                <td>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                      row?.status
                    )}`}
                  >
                    {row?.status
                      ? row.status
                        .replace(/[_-]/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                      : "—"}
                  </span>
                </td>

                <td className="p-3" style={{ color: colors.text.primary }}>
                  {row?.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3 text-right">
                  {/* Request for Finish Goods button */}
                  {row?.status !== "out finish goods" && (
                    <button
                      disabled={row?.status === "allocated finish goods"}
                      onClick={() => onApprove(row?._id)}
                      className="px-3 py-2 text-xs font-medium rounded-md border transition-all mr-2 whitespace-nowrap"
                      style={{
                        backgroundColor: colors.primary[50],
                        borderColor: colors.primary[200],
                        color: colors.primary[700],
                        minWidth: "fit-content",
                        opacity: row?.status === "allocated finish goods" ? 0.5 : 1,  // Adjust opacity when disabled
                      }}
                    >
                      Request for Finish Goods
                    </button>
                  )}


                  {/* Receive by Inventory button */}
                  {row?.status === "out finish goods" && (
                    <button
                      onClick={() => receiveByInventory(row?._id)}
                      className="px-3 py-2 text-xs font-medium rounded-md border transition-all whitespace-nowrap cursor-pointer"
                      style={{
                        backgroundColor: colors.primary[50],
                        borderColor: colors.primary[200],
                        color: colors.primary[700],
                        minWidth: "fit-content",
                      }}
                    >
                      Receive by Inventory
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="p-6 text-center"
                style={{ color: colors.text.secondary }}
              >
                No pending finished goods.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FinishedGoodsTable;
