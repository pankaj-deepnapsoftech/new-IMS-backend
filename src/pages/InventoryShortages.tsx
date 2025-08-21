import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../theme/colors";

const InventoryShortages: React.FC = () => {
  const [cookies] = useCookies();
  const [shortages, setShortages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShortages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}bom/inventory-shortages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      ); 
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setShortages(data.shortages || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch inventory shortages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShortages();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.page }}>
      <div className="p-2 lg:p-3">
        <div className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6" style={{ backgroundColor: colors.background.card }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>Inventory Shortages</h1>
          <p className="text-gray-600 mb-4">List of BOM inventory shortages</p>
          <button
            onClick={fetchShortages}
            className="mb-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
          {isLoading ? (
            <div>Loading...</div>
          ) : shortages.length === 0 ? (
            <div>No shortages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">BOM Name</th>
                    <th className="px-4 py-2 border">Material Name</th>
                    <th className="px-4 py-2 border">Required</th>
                    <th className="px-4 py-2 border">Available</th>
                    <th className="px-4 py-2 border">Shortage</th>
                  </tr>
                </thead>
                <tbody>
                  {shortages.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 border">{item.bom_name || "-"}</td>
                      <td className="px-4 py-2 border">{item.material_name || "-"}</td>
                      <td className="px-4 py-2 border">{item.required_qty}</td>
                      <td className="px-4 py-2 border">{item.available_qty}</td>
                      <td className="px-4 py-2 border text-red-600 font-bold">{item.shortage_qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryShortages;
