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
  Plus,
  Trash2,
} from "lucide-react";

interface ScrapMaterialProps {
  inputs: any[];
  products: any[];
  productOptions: any[];
  setInputs: (inputs: any) => void;
}

const ScrapMaterial: React.FC<ScrapMaterialProps> = ({
  inputs,
  setInputs,
  products,
  productOptions,
}) => {
  const [cookies] = useCookies();
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

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
    }

    setInputs(inputsArr);
  };

  const addInputHandler = () => {
    setInputs((prev: any) => [
      ...prev,
      {
        item_name: "",
        description: "",
        estimated_quantity: "",
        produced_quantity: "",
        uom: "",
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

  useEffect(() => {
    let prods = [];
    prods = inputs?.map((material: any) => ({
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
    <div className="space-y-6">
      {inputs &&
        inputs.map((input, ind) => (
          <div
            key={ind}
            className="bg-gray-50 rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-red-600" />
                Scrap Material #{ind + 1}
              </h4>
              {inputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteInputHandler(ind)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

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
                  Quantity
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

      {/* Add/Remove Buttons */}
      <div className="flex items-center justify-end gap-3">
        {inputs && inputs.length > 1 && (
          <button
            type="button"
            onClick={() => deleteInputHandler(inputs.length - 1)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 bg-red-50 font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
          >
            <BiMinus className="h-4 w-4" />
            Remove
          </button>
        )}
        <button
          type="button"
          onClick={addInputHandler}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>
    </div>
  );
};

export default ScrapMaterial;
