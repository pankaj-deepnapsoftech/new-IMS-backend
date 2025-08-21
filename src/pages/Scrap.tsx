// @ts-nocheck

import { Button } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import ScrapTable from "../components/Table/ScrapTable";
import { toast } from "react-toastify";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import { Recycle } from "lucide-react";

const Scrap: React.FC = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState<any[] | []>([]);
  const [filteredData, setFilteredData] = useState<any[] | []>([]);
  const [isLoadingScraps, setIsLoadingScraps] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string | undefined>();

  const fetchScrapHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "scrap/all",
        {
          method:"GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setData(data.scraps);
      setFilteredData(data.scraps);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchScrapHandler();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    const results = data.filter(
      (scrap: any) =>
        scrap.bom.bom_name?.toLowerCase()?.includes(searchTxt) ||
        scrap.item.name?.toLowerCase()?.includes(searchTxt) ||
        scrap.produced_quantity.toString().toLowerCase().includes(searchTxt) ||
        scrap.estimated_quantity.toString().toLowerCase().includes(searchTxt) ||
        (scrap?.createdAt &&
          new Date(scrap?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (scrap?.updatedAt &&
          new Date(scrap?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredData(results);
  }, [searchKey]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      <div className="p-2 lg:p-3">
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
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <Recycle className="text-white" size={24} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Scrap Management
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Track and manage production scrap materials
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={fetchScrapHandler}
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
                Search Scrap Materials
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
                  placeholder="Search by BOM, item name, quantity..."
                  value={searchKey || ""}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrap Table */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <ScrapTable
            scraps={filteredData}
            isLoadingScraps={isLoadingScraps}
            openScrapDetailsDrawerHandler={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
   
export default Scrap;
