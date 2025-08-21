import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Select from "react-select";
import { toast } from "react-toastify";

interface ProcessScrapMaterialProps {
  inputs: any[];
  products: any[];
  productOptions: any[];
  setInputs: (inputs: any) => void;
}

const ProcessScrapMaterial: React.FC<ProcessScrapMaterialProps> = ({
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

    if (name === "produced_quantity") {
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
      backgroundColor: "transparent",
      borderColor: "#a9a9a9",
      color: "#000",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#d3d3d3" : "#fff", // darker on hover
      color: "black",
      cursor: "pointer",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#808080",
      color: "#000",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999, // ensures dropdown doesn't get hidden
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#000", // light gray placeholder
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#000", // ensures selected value is white
    }),
  };
  return (
    <div>
      <FormControl>
        {inputs &&
          inputs.map((input, ind) => (
            <div key={ind}>
              <FormControl className="mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Product Name
                </FormLabel>
                <Select
                  styles={customStyles}
                  isDisabled
                  required
                  className="rounded mt-2 border border-[#a9a9a9]"
                  options={productOptions}
                  placeholder="Select"
                  value={selectedProducts[ind]?.label}
                  name="item_name"
                  onChange={(d) => {
                    onChangeHandler("item_name", d, ind);
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" color="black">
                  Description
                </FormLabel>
                <Input
                  className="text-gray-200"
                  isDisabled
                  border="1px"
                  borderColor="#a9a9a9"
                  onChange={(e) => {
                    onChangeHandler(e.target.name, e.target.value, ind);
                  }}
                  type="text"
                  name="description"
                  value={input.description}
                ></Input>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" color="black">
                  Estimated Quantity
                </FormLabel>
                <Input
                  className="text-gray-200"
                  isDisabled
                  border="1px"
                  borderColor="#a9a9a9"
                  onChange={(e) => {
                    onChangeHandler(e.target.name, e.target.value, ind);
                  }}
                  type="number"
                  name="estimated_quantity"
                  value={input.estimated_quantity}
                ></Input>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" color="black">
                  Produced Quantity
                </FormLabel>
                <Input
                  className="text-gray-200"
                  border="1px"
                  borderColor="#a9a9a9"
                  onChange={(e) => {
                    onChangeHandler(e.target.name, e.target.value, ind);
                  }}
                  type="number"
                  name="produced_quantity"
                  value={input.produced_quantity}
                ></Input>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" color="black">
                  UOM
                </FormLabel>
                <Input
                  className="text-gray-200"
                  isDisabled={true}
                  border="1px"
                  borderColor="#a9a9a9"
                  type="text"
                  name="uom"
                  value={input.uom}
                ></Input>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" color="black">
                  Unit Cost
                </FormLabel>
                <Input
                  className="text-gray-200"
                  isDisabled={true}
                  border="1px"
                  borderColor="#a9a9a9"
                  onChange={(e) => {
                    onChangeHandler(e.target.name, e.target.value, ind);
                  }}
                  type="number"
                  name="unit_cost"
                  value={input.unit_cost}
                ></Input>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold" color="black">
                  Total Part Cost
                </FormLabel>
                <input
                  disabled={true}
                  onChange={(e) => {
                    onChangeHandler(e.target.name, e.target.value, ind);
                  }}
                  type="number"
                  name="total_part_cost"
                  value={input.total_part_cost}
                  className="rounded px-2 text-gray-200 py-[6px] w-[300px] border-[1px] border-[#a9a9a9] disabled:cursor-not-allowed disabled:bg-transparent"
                ></input>
              </FormControl>
            </div>
          ))}
      </FormControl>
    </div>
  );
};

export default ProcessScrapMaterial;
