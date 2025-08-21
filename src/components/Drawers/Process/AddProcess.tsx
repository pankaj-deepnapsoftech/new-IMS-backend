import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useCreateProcessMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";
import {
  Package,
  FileText,
  Hash,
  Store,
  Settings,
  Layers,
  Factory,
  Plus,
} from "lucide-react";

interface AddProcess {
  closeDrawerHandler: () => void;
  fetchProcessHandler: () => void;
}

const AddProcess: React.FC<AddProcess> = ({
  closeDrawerHandler,
  fetchProcessHandler,
}) => {
  const [cookies] = useCookies();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [itemId, setItemId] = useState<string | undefined>();
  const [itemName, setItemName] = useState<
    { value: string; label: string } | undefined
  >();
  const [bom, setBom] = useState<
    { value: string; label: string } | undefined
  >();
  const [currentStock, setCurrentStock] = useState<number | undefined>();
  const [quantity, setQuantity] = useState<number | undefined>();
  const [uom, setUom] = useState<number | undefined>();
  const [fgStore, setFgStore] = useState<
    { value: string; label: string } | undefined
  >();
  const [rmStore, setRmStore] = useState<
    { value: string; label: string } | undefined
  >();
  const [scrapStore, setScrapStore] = useState<
    { value: string; label: string } | undefined
  >();

  const [itemNameOptions, setItemNameOptions] = useState<
    { value: string; label: string }[] | []
  >();
  const [bomOptions, setBomOptions] = useState<
    { value: string; label: string }[] | []
  >();
  const [fgStoreOptions, setFgStoreOptions] = useState<
    { value: string; label: string }[] | []
  >();
  const [rmStoreOptions, setRmStoreOptions] = useState<
    { value: string; label: string }[] | []
  >();
  const [scrapStoreOptions, setScrapStoreOptions] = useState<
    { value: string; label: string }[] | []
  >();

  const [items, setItems] = useState<any[]>([]);
  const [boms, setBoms] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  const [addProcess] = useCreateProcessMutation();

  const addProcessHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      item: itemName?.value,
      bom: bom?.value,
      quantity: quantity,
      rm_store: rmStore?.value,
      fg_store: fgStore?.value,
      scrap_store: scrapStore?.value,
    };

    try {
      setIsAdding(true);
      const response = await addProcess(data).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeDrawerHandler();
      fetchProcessHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const fetchItemsHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/all",
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
      setItems(data.products);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const fetchBomsHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/bom/${itemName?.value}`,
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
      setBoms(data.boms);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const fetchStoresHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "store/all",
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
      setStores(data.stores);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    const results = items.filter((prd) => prd.category === "finished goods")
      .map((prd) => ({
        value: prd._id,
        label: prd.name,
      }));
    setItemNameOptions(results);
  }, [items]);


  useEffect(() => {
    const item = items.find((item: any) => item._id === itemName?.value);
    setItemId(item?.product_id || "");
    setCurrentStock(item?.current_stock);
    setUom(item?.uom);
  }, [itemName]);

  useEffect(() => {
    if (itemName?.value) {
      fetchBomsHandler();
    }
  }, [itemName]);

  useEffect(() => {
    const results = boms.map((bom: any) => ({
      value: bom._id,
      label: bom.bom_name,
    }));
    setBomOptions(results);
  }, [boms]);

  useEffect(() => {
    if (bom) {
      const result = boms.find((b: any) => b._id === bom?.value);
      setQuantity(result?.finished_good?.quantity);
    }
  }, [bom]);

  useEffect(() => {
    const results = stores.map((store: any) => ({
      value: store._id,
      label: store.name,
    }));
    setRmStoreOptions(results);
    setScrapStoreOptions(results);
    setFgStoreOptions(results);
  }, [stores]);

  useEffect(() => {
    fetchItemsHandler();
    fetchStoresHandler();
  }, []);
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: colors.gray[300],
      color: colors.gray[900],
      minHeight: "42px",
      borderRadius: "8px",
      boxShadow: "none",
      "&:hover": {
        borderColor: colors.primary[500],
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? colors.primary[50] : "white",
      color: colors.gray[900],
      cursor: "pointer",
      "&:hover": {
        backgroundColor: colors.primary[100],
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: colors.primary[100],
      color: colors.primary[800],
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "8px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: colors.gray[500],
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.gray[900],
    }),
  };
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className=" fixed inset-y-0 right-0 z-50 w-full  bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className=" px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 border rounded-lg">
                <Factory className="h-5 w-5 text-black" />
              </div>
              <h2 className="text-xl font-semibold text-black">
                Add Production Process
              </h2>
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
            <form onSubmit={addProcessHandler} className="space-y-6">
              {/* Item Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Item Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Item ID */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Hash className="h-4 w-4 text-gray-500" />
                      Item ID
                    </label>
                    <input
                      type="text"
                      value={itemId || ""}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Item Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Package className="h-4 w-4 text-gray-500" />
                      Item Name *
                    </label>
                    <Select
                      styles={customStyles}
                      value={itemName}
                      options={itemNameOptions}
                      onChange={(d: any) => setItemName(d)}
                      placeholder="Select an item"
                      required
                    />
                  </div>

                  {/* BOM */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Layers className="h-4 w-4 text-gray-500" />
                      BOM *
                    </label>
                    <Select
                      styles={customStyles}
                      value={bom}
                      options={bomOptions}
                      onChange={(d: any) => setBom(d)}
                      placeholder="Select a BOM"
                      required
                    />
                  </div>

                  {/* Current Stock */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Hash className="h-4 w-4 text-gray-500" />
                      Current Stock
                    </label>
                    <input
                      type="number"
                      value={currentStock || ""}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Hash className="h-4 w-4 text-gray-500" />
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={quantity || ""}
                      onChange={(e) => setQuantity(+e.target.value)}
                      placeholder="Enter quantity"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      required
                    />
                  </div>

                  {/* UOM */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Package className="h-4 w-4 text-gray-500" />
                      Unit of Measurement
                    </label>
                    <input
                      type="text"
                      value={uom || ""}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Store Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 ">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Store className="h-5 w-5 text-green-600" />
                  Store Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* FG Store */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Store className="h-4 w-4 text-gray-500" />
                      Finished Goods Store *
                    </label>
                    <Select
                      styles={customStyles}
                      value={fgStore}
                      options={fgStoreOptions}
                      onChange={(d: any) => setFgStore(d)}
                      placeholder="Select FG store"
                      required
                    />
                  </div>

                  {/* RM Store */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Store className="h-4 w-4 text-gray-500" />
                      Raw Materials Store *
                    </label>
                    <Select
                      styles={customStyles}
                      value={rmStore}
                      options={rmStoreOptions}
                      onChange={(d: any) => setRmStore(d)}
                      placeholder="Select RM store"
                      required
                    />
                  </div>

                  {/* Scrap Store */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Store className="h-4 w-4 text-gray-500" />
                      Scrap Store *
                    </label>
                    <Select
                      styles={customStyles}
                      value={scrapStore}
                      options={scrapStoreOptions}
                      onChange={(d: any) => setScrapStore(d)}
                      placeholder="Select scrap store"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white border-t p-6 -mx-6 -mb-6">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Process
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProcess;
