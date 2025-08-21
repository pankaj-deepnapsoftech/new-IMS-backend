import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { BiMinus } from "react-icons/bi";
import { IoIosAdd } from "react-icons/io";
import Select from "react-select";
import { toast } from "react-toastify";
import { colors } from "../../theme/colors";
import {
  Package,
  FileText,
  Hash,
  Calculator,
  DollarSign,
  Settings,
  Users,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

interface RawMaterialProps {
  inputs: any[];
  products: any[];
  productOptions: any[];
  setInputs: (inputs: any) => void;
}

const RawMaterial: React.FC<RawMaterialProps> = ({
  inputs,
  setInputs,
  products,
  productOptions,
}) => {
  const [cookies] = useCookies();
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState<boolean>(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [suppliersOptionsList, setSuppliersOptionsList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any[]>([]);

  const assemblyPhaseOptions = [
    { value: "not started", label: "Not Started" },
    { value: "in production", label: "In Production" },
    { value: "in review", label: "In Review" },
    { value: "complete", label: "Complete" },
  ];

  const onChangeHandler = (name: string, value: string, ind: number) => {
    const inputsArr: any = [...inputs];
    inputsArr[ind][name] = value;

    if (name === "quantity") {
      const unit_cost = inputsArr[ind]["unit_cost"];
      if (unit_cost) {
        inputsArr[ind]["total_part_cost"] = +unit_cost * +value;
      }
    } else if (name === "item_name") {
      const item_id = inputsArr[ind]["item_name"].value;
      const product = products.filter((prd: any) => prd._id === item_id)[0];
      inputsArr[ind]["uom"] = product.uom;
      inputsArr[ind]["unit_cost"] = product.price;
      inputsArr[ind]["category"] = product.category;
    }

    setInputs(inputsArr);
  };

  const addInputHandler = () => {
    setInputs((prev: any) => [
      ...prev,
      {
        item_id: "",
        item_name: "",
        description: "",
        quantity: "",
        uom: "",
        category: "",
        assembly_phase: "",
        supplier: "",
        comments: "",
        unit_cost: "",
        total_part_cost: "",
      },
    ]);
  };

  const deleteInputHandler = (ind: number) => {
    const inputsArr = [...inputs];
    inputsArr.splice(ind, 1);
    setInputs(inputsArr);
  };

  const fetchSuppliersHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "agent/suppliers",
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
      setSuppliers(data.agents);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchSuppliersHandler();
  }, []);

  useEffect(() => {
    const supplierOptions = suppliers.map((supp) => ({
      value: supp._id,
      label: supp.name,
    }));
    setSuppliersOptionsList(supplierOptions);
  }, [suppliers]);

  useEffect(() => {
    let prods = [];
    prods = inputs.map((material: any) => ({
      value: material.item_id || material.item_name?.value || "",
      label:
        typeof material.item_name === "object"
          ? material.item_name.label
          : material.item_name,
    }));
    setSelectedProducts(prods);
  }, [inputs]);
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
    <div className="space-y-4">
      {inputs.map((input, ind) => (
        <div
          key={ind}
          className="bg-gray-50 rounded-lg border border-gray-200 p-6 relative"
        >
          {/* Delete Button */}
          {inputs.length > 1 && (
            <button
              type="button"
              onClick={() => deleteInputHandler(ind)}
              className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="h-4 w-4 text-gray-500" />
                Product Name *
              </label>
              <Select
                styles={customStyles}
                className="text-sm"
                options={productOptions}
                placeholder="Select product"
                value={selectedProducts[ind] || null}
                name="item_name"
                onChange={(d) => {
                  onChangeHandler("item_name", d, ind);
                }}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 text-gray-500" />
                Description
              </label>
              <input
                type="text"
                name="description"
                value={input.description || ""}
                onChange={(e) => {
                  onChangeHandler(e.target.name, e.target.value, ind);
                }}
                placeholder="Enter description"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
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
                name="quantity"
                value={input.quantity || ""}
                onChange={(e) => {
                  onChangeHandler(e.target.name, e.target.value, ind);
                }}
                placeholder="Enter quantity"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                required
              />
            </div>

            {/* UOM */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calculator className="h-4 w-4 text-gray-500" />
                Unit of Measurement
              </label>
              <input
                type="text"
                name="uom"
                value={input.uom || ""}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="h-4 w-4 text-gray-500" />
                Category
              </label>
              <input
                type="text"
                name="category"
                value={input.category || ""}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Assembly Phase */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Settings className="h-4 w-4 text-gray-500" />
                Assembly Phase
              </label>
              <Select
                styles={customStyles}
                className="text-sm"
                options={assemblyPhaseOptions}
                placeholder="Select assembly phase"
                value={input.assembly_phase || null}
                name="assembly_phase"
                onChange={(d) => {
                  onChangeHandler("assembly_phase", d, ind);
                }}
              />
            </div>

            {/* Supplier */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 text-gray-500" />
                Supplier
              </label>
              <Select
                styles={customStyles}
                className="text-sm"
                options={suppliersOptionsList}
                placeholder="Select supplier"
                value={input.supplier || null}
                name="supplier"
                onChange={(d) => {
                  onChangeHandler("supplier", d, ind);
                }}
              />
            </div>

            {/* Comments */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                Comments
              </label>
              <input
                type="text"
                name="comments"
                value={input.comments || ""}
                onChange={(e) => {
                  onChangeHandler(e.target.name, e.target.value, ind);
                }}
                placeholder="Enter comments"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
              />
            </div>

            {/* Unit Cost */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Unit Cost
              </label>
              <input
                type="number"
                name="unit_cost"
                value={input.unit_cost || ""}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Total Part Cost */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Total Cost
              </label>
              <input
                type="number"
                name="total_part_cost"
                value={input.total_part_cost || ""}
                disabled
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add New Item Button */}
      <button
        type="button"
        onClick={addInputHandler}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Raw Material
      </button>
    </div>
  );
};

export default RawMaterial;
