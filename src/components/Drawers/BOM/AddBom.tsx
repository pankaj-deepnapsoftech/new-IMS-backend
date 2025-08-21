// @ts-nocheck

import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useAddBomMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";
import {
  Package,
  FileText,
  Hash,
  Layers,
  DollarSign,
  Settings,
  Upload,
  MessageSquare,
  Calculator,
  Plus,
  Trash2,
} from "lucide-react";

interface AddBomProps {
  closeDrawerHandler: () => void;
  fetchBomsHandler: () => void;
}

const AddBom: React.FC<AddBomProps> = ({
  closeDrawerHandler,
  fetchBomsHandler,
}) => {
  const [cookies] = useCookies();
  const [bomName, setBomName] = useState<string | undefined>();
  const [partsCount, setPartsCount] = useState<number>(0);
  const [totalPartsCost, setTotalPartsCost] = useState<number>(0);
  const [finishedGoodsOptions, setFinishedGoodsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [rawMaterialsOptions, setRawMaterialsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [manPowerOptions, setManPowerOptions] = useState<{ value: string; label: string }[]>([]);

  const [finishedGood, setFinishedGood] = useState<
    { value: string; label: string } | undefined
  >();
  const [description, setDescription] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number | undefined>();
  const [uom, setUom] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const supportingDoc = useRef<HTMLInputElement | null>(null);
  const [comments, setComments] = useState<string | undefined>();
  const [cost, setCost] = useState<number | undefined>();
  const [unitCost, setUnitCost] = useState<string | undefined>();
  const [processes, setProcesses] = useState<string[]>([""]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [remarks, setRemarks] = useState<string>("");
  const [finishedGoodName, setFinishedGoodName] = useState("");
  // const [category, setCategory] = useState("");
  const [labourCharges, setLabourCharges] = useState<number | undefined>();
  const [machineryCharges, setMachineryCharges] = useState<
    number | undefined
  >();
  const [electricityCharges, setElectricityCharges] = useState<
    number | undefined
  >();

  const [otherCharges, setOtherCharges] = useState<number | undefined>();
  const [resources, setResources] = useState<any[]>([]);
  const [empData, setEmpData] = useState<any[]>([]);
  const [resourceOptions, setResourceOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedResources, setSelectedResources] = useState([
    { name: null, type: null, specification: "" },
  ]);
  // NEW: user-entered manpower (string) and auto-calculated available count
  const [manpowerInput, setManpowerInput] = useState<string>("");
  const [manpowerCount, setManpowerCount] = useState<number>(0);

  const [addBom] = useAddBomMutation();

  const [rawMaterials, setRawMaterials] = useState<any[]>([
    {
      item_name: "",
      description: "",
      quantity: "",
      uom: "",
      assembly_phase: "",
      supplier: "",
      supporting_doc: "",
      comments: "",
      unit_cost: "",
      total_part_cost: "",
    },
  ]);

  const [scrapMaterials, setScrapMaterials] = useState<any[]>([
    {
      item_name: "",
      description: "",
      quantity: "",
      uom: "",
      unit_cost: "",
      total_part_cost: "",
    },
  ]);

  const categoryOptions = [
    { value: "finished goods", label: "Finished Goods" },
    { value: "raw materials", label: "Raw Materials" },
    { value: "semi finished goods", label: "Semi Finished Goods" },
    { value: "consumables", label: "Consumables" },
    { value: "bought out parts", label: "Bought Out Parts" },
    { value: "trading goods", label: "Trading Goods" },
    { value: "service", label: "Service" },
  ];

  const uomOptions = [
    { value: "pcs", label: "pcs" },
    { value: "kgs", label: "kgs" },
    { value: "ltr", label: "ltr" },
    { value: "tonne", label: "tonne" },
    { value: "cm", label: "cm" },
    { value: "inch", label: "inch" },
    { value: "mtr", label: "mtr" },
  ];





  const addBomHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const fileInput = supportingDoc.current as HTMLInputElement;
    let pdfUrl;
    if (fileInput && fileInput?.files && fileInput.files.length > 0) {
      try {
        const formData = new FormData();

        formData.append("file", fileInput?.files && fileInput.files[0]);

        const uploadedFileResponse = await fetch(
          process.env.REACT_APP_FILE_UPLOAD_URL!,
          {
            method: "POST",
            body: formData as unknown as BodyInit,
          }
        );
        const uploadedFile: any = await uploadedFileResponse.json();
        if (uploadedFile?.error) {
          throw new Error(uploadedFile?.error);
        }

        pdfUrl = uploadedFile[0];
      } catch (err: any) {
        toast.error(err.message || "Something went wrong during file upload");
        return;
      }
    }

    let modifiedRawMaterials = rawMaterials.map((material) => ({
      item: material?.item_name?.value,
      description: material?.description,
      quantity: material?.quantity,
      assembly_phase: material?.assembly_phase?.value,
      supplier: material?.supplier?.value,
      supporting_doc: material?.supporting_doc,
      comments: material?.comments,
      total_part_cost: material?.total_part_cost,
    }));

    let modifiedScrapMaterials =
      scrapMaterials?.[0]?.item_name &&
      scrapMaterials.map((material) => ({
        item: material?.item_name?.value,
        description: material?.description,
        quantity: material?.quantity,
        total_part_cost: material?.total_part_cost,
      }));

    const body = {
      raw_materials: modifiedRawMaterials,
      scrap_materials: modifiedScrapMaterials,
      processes: processes,
      finished_good: {
        item: finishedGood?.value,
        description: description,
        quantity: quantity,
        supporting_doc: pdfUrl,
        comments: comments,
        cost: cost,
      },
      bom_name: bomName,
      parts_count: partsCount,
      total_cost: totalPartsCost,
      other_charges: {
        labour_charges: labourCharges || 0,
        machinery_charges: machineryCharges || 0,
        electricity_charges: electricityCharges || 0,
        other_charges: otherCharges || 0,
      },
      manpower: [
        {
          number: String(manpowerInput || manpowerCount),
        },
      ],




      remarks: remarks,
      resources: selectedResources.map((r) => ({
        resource_id: r.name?.value,
        type: r.type?.value || r.type,
        specification: r.specification?.value || r.specification,
        comment: r.comment || "",
        customId: r.customId,
      }))



    };
    // console.log(body)
    try {
      const response = await addBom(body).unwrap();
      toast.success(response?.message);
      fetchBomsHandler();
      closeDrawerHandler();
      console.log(response);
    } catch (error: any) {
      if (error?.data?.message?.includes("Insufficient stock")) {
        fetchBomsHandler();
        closeDrawerHandler();
      }
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  console.log(resources)

  const fetchProductsHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const results = await response.json();
      if (!results.success) {
        throw new Error(results?.message);
      }
      setProducts(results.products);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
    }
  };


  const fetchResourceHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "resources",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const results = await response.json();
      if (!results.success) {
        throw new Error(results?.message);
      }
      setResources(results.resources);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchEmployeeHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "auth/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const results = await response.json();
      if (!results.success) {
        throw new Error(results?.message);
      }
      const manPowerUsers = results?.users?.filter(
        (user: any) =>
          user.role?.role?.toLowerCase().includes("man power")
      );

      setEmpData(manPowerUsers);

    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const onFinishedGoodChangeHandler = (d: any) => {
    setFinishedGood(d);
    const product: any = products.find((prd: any) => prd._id === d.value);

    if (product) {
      setCategory(product.category || "N/A");
      setUom(product.uom || "");
      setUnitCost(product.price || 0);

      if (product.category === "finished goods") {
        setFinishedGoodName(product.name || "");
      } else {
        setFinishedGoodName(""); // Clear name otherwise
      }

      if (quantity) {
        setCost((product.price || 0) * +quantity);
      }
    } else {
      toast.error("Product not found");
    }
  };

  const onFinishedGoodQntyChangeHandler = (qty: number) => {
    setQuantity(qty);
    if (unitCost) {
      setCost(+unitCost * qty);
    }
  };

  useEffect(() => {
    if (
      rawMaterials[rawMaterials.length - 1].unit_cost !== "" &&
      rawMaterials[rawMaterials.length - 1].quantity !== ""
    ) {
      setPartsCount(rawMaterials.length);
      const cost = rawMaterials.reduce(
        (prev, current) => prev + +current?.unit_cost * +current?.quantity,
        0
      );
      setTotalPartsCost(cost);
    }
  }, [rawMaterials]);

  useEffect(() => {
    // empData ko fetchEmployeeHandler me already filtered man-power users ke saath set kiya ja raha tha
    setManpowerCount(empData?.length || 0);
  }, [empData]);


  useEffect(() => {
    fetchProductsHandler();
    fetchResourceHandler();
    fetchEmployeeHandler();
  }, []);

  useEffect(() => {
    const finishedGoodsOptions = products
      .filter((prd) => prd.category === "finished goods")
      .map((prd) => ({
        value: prd._id,
        label: prd.name,
      }));

    const rawMaterialsOptions = products
      .filter((prd) => prd.category === "raw materials")
      .map((prd) => ({
        value: prd._id,
        label: prd.name,
      }));

    setFinishedGoodsOptions(finishedGoodsOptions);
    setRawMaterialsOptions(rawMaterialsOptions);
  }, [products]);

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

  useEffect(() => {
    const resourceOptions = resources?.map((res: any) => ({
      label: res.name,
      value: res._id,
      type: res.type,
      specification: res.specification,
      customId: res.customId,
    }));


    setResourceOptions(resourceOptions);
  }, [resources]);

  useEffect(() => {
    if (!empData || empData.length === 0) return;

    const filtered = empData.filter((emp) =>
      emp.role?.role?.toLowerCase().includes("man power")
    );

    const options = filtered.map((emp) => ({
      value: emp._id,
      label: `${emp.first_name} ${emp.last_name}`,
    }));

    setManPowerOptions(options);
  }, [empData]);



  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 text-black flex border items-center justify-between">
            <h2 className="text-xl font-semibold">Add New BOM</h2>
            <button
              onClick={closeDrawerHandler}
              className="p-1 border rounded transition-colors duration-200"
            >
              <BiX size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <form onSubmit={addBomHandler}>
              {/* Finished Good Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Finished Good
                  </h3>

                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-7 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Finished Goods</div>
                    <div>Quantity</div>
                    <div>UOM</div>
                    <div>Comments</div>
                    <div>Unit Cost</div>
                    <div>Cost</div>
                  </div>

                  {/* Responsive Row */}
                  <div className="border border-t-0 border-gray-300">
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 px-3 py-4 sm:items-center bg-white">
                      {/* Finished Goods */}
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Finished Goods
                        </label>
                        <Select
                          styles={customStyles}
                          className="text-sm"
                          options={finishedGoodsOptions}
                          placeholder="Select"
                          value={finishedGood}
                          onChange={onFinishedGoodChangeHandler}
                          // isSearchable={true} // <-- Make sure this is set
                          required
                        />

                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={quantity || ""}
                          onChange={(e) =>
                            onFinishedGoodQntyChangeHandler(+e.target.value)
                          }
                          placeholder="Quantity"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>

                      {/* UOM */}
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          UOM
                        </label>
                        <input
                          type="text"
                          value={uom || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>

                      {/* Category */}
                      {/* <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Category
                        </label>
                        <input
                          type="text"
                          value={category || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div> */}

                      {/* Comments */}
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Comments
                        </label>
                        <input
                          type="text"
                          value={comments || ""}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Comments"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      {/* Unit Cost */}
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Unit Cost
                        </label>
                        <input
                          type={cookies?.role === "admin" ? "number" : "text"}
                          value={
                            cookies?.role === "admin"
                              ? unitCost || ""
                              : unitCost
                                ? "*****"
                                : ""
                          }
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>

                      {/* Cost */}
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Cost
                        </label>
                        <input
                          type={cookies?.role === "admin" ? "number" : "text"}
                          value={
                            cookies?.role === "admin"
                              ? cost || ""
                              : cost
                                ? "*****"
                                : ""
                          }
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Materials Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Raw Materials
                    </h3>
                  </div>

                  {/* Table Header for larger screens */}
                  <div className="hidden sm:grid grid-cols-8 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Product Name</div>
                    <div>Quantity</div>
                    <div>UOM</div>
                    {/* <div>Category</div> */}
                    <div>Comments</div>
                    <div>Unit Cost</div>
                    <div>Total Part Cost</div>
                    <div>Action</div>
                  </div>

                  <div className="border border-t-0 border-gray-300">
                    {rawMaterials.map((material, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-8 gap-4 px-3 py-4 items-start sm:items-center bg-white border-b border-gray-200 last:border-b-0"
                      >
                        {/* Product Name */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Product Name
                          </label>
                          <Select
                            styles={customStyles}
                            className="text-sm"
                            options={rawMaterialsOptions}
                            placeholder="Select"
                            value={material.item_name}
                            onChange={(d) => {
                              const newMaterials = [...rawMaterials];
                              newMaterials[index].item_name = d;
                              const product = products.find(
                                (p) => p._id === d?.value
                              );
                              if (product) {
                                newMaterials[index].unit_cost = product.price;
                                newMaterials[index].uom = product.uom;
                                newMaterials[index].category = product.category;
                                if (material.quantity) {
                                  newMaterials[index].total_part_cost =
                                    product.price * +material.quantity;
                                }
                              }
                              setRawMaterials(newMaterials);
                            }}
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Quantity
                          </label>
                          <input
                            required
                            type="number"
                            value={material.quantity || ""}
                            onChange={(e) => {
                              const newMaterials = [...rawMaterials];
                              newMaterials[index].quantity = e.target.value;
                              if (material.unit_cost && e.target.value) {
                                newMaterials[index].total_part_cost =
                                  +material.unit_cost * +e.target.value;
                              }
                              setRawMaterials(newMaterials);
                            }}
                            placeholder="0"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        {/* UOM */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            UOM
                          </label>
                          <input
                            type="text"
                            value={material.uom || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Category
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Category
                          </label>
                          <input
                            type="text"
                            value={material.category || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div> */}

                        {/* Comments */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Comments
                          </label>
                          <input
                            type="text"
                            value={material.comments || ""}
                            onChange={(e) => {
                              const newMaterials = [...rawMaterials];
                              newMaterials[index].comments = e.target.value;
                              setRawMaterials(newMaterials);
                            }}
                            placeholder="Comments"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        {/* Unit Cost */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Unit Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.unit_cost || ""
                                : material.unit_cost
                                  ? "*****"
                                  : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Total Part Cost */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Total Part Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.total_part_cost || ""
                                : material.total_part_cost
                                  ? "*****"
                                  : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Action */}
                        <div className="flex sm:justify-center items-center gap-2">
                          {rawMaterials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newMaterials = rawMaterials.filter(
                                  (_, i) => i !== index
                                );
                                setRawMaterials(newMaterials);
                              }}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                            >
                              ✕
                            </button>
                          )}
                          <button
                            type="button"
                            className="ml-4 px-2 py-1.5 flex justify-center items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded transition-colors whitespace-nowrap"
                            onClick={() => {
                              setRawMaterials([
                                ...rawMaterials,
                                {
                                  item_name: "",
                                  description: "",
                                  quantity: "",
                                  uom: "",
                                  category: "",
                                  assembly_phase: "",
                                  supplier: "",
                                  supporting_doc: "",
                                  comments: "",
                                  unit_cost: "",
                                  total_part_cost: "",
                                },
                              ]);
                            }}
                          >
                            <Plus size={16} /> Add RM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Raw Materials Summary Section */}
              {(() => {
                // Group raw materials by name and calculate totals
                const groupedMaterials = {};
                rawMaterials.forEach((material, index) => {
                  if (material.item_name?.label) {
                    const itemName = material.item_name.label;
                    if (!groupedMaterials[itemName]) {
                      groupedMaterials[itemName] = {
                        name: itemName,
                        totalQuantity: 0,
                        totalCost: 0,
                        materials: []
                      };
                    }
                    const quantity = parseFloat(material.quantity) || 0;
                    const cost = parseFloat(material.total_part_cost) || 0;
                    groupedMaterials[itemName].totalQuantity += quantity;
                    groupedMaterials[itemName].totalCost += cost;
                    groupedMaterials[itemName].materials.push({ index, quantity, cost });
                  }
                });

                const hasDuplicates = Object.values(groupedMaterials).some(group => group.materials.length > 1);
                
                if (hasDuplicates) {
                  return (
                    <div className="bg-yellow-50 border-b border-yellow-200">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-yellow-800">
                            📊 Raw Materials Summary (Same Name Items Combined)
                          </h3>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-yellow-300 p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                            {Object.values(groupedMaterials).map((group, idx) => (
                              <div key={idx} className="bg-yellow-100 p-3 rounded border border-yellow-400">
                                <div className="font-semibold text-yellow-900">{group.name}</div>
                                <div className="text-yellow-800">
                                  <div>Total Quantity: <span className="font-bold">{group.totalQuantity}</span></div>
                                  {cookies?.role === "admin" && (
                                    <div>Total Cost: <span className="font-bold">₹{group.totalCost.toFixed(2)}</span></div>
                                  )}
                                  <div className="text-xs text-yellow-700 mt-1">
                                    {group.materials.length > 1 ? 
                                      `${group.materials.length} entries combined` : 
                                      'Single entry'
                                    }
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-yellow-700 bg-yellow-200 p-2 rounded">
                            💡 <strong>Note:</strong> Items with the same name will be combined and their quantities will be added together for stock checking.
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Process Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Processes
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {processes.map((process, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-end sm:gap-2 border p-3 rounded-lg relative"
                      >
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Process {index + 1}
                          </label>
                          <input
                            type="text"
                            value={process}
                            onChange={(e) => {
                              const newProcesses = [...processes];
                              newProcesses[index] = e.target.value;
                              setProcesses(newProcesses);
                            }}
                            placeholder={`Enter Process ${index + 1}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        {processes.length > 1 && (
                          <div className="mt-2 sm:mt-0">
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800 sm:ml-2"
                              onClick={() => {
                                const newProcesses = processes.filter(
                                  (_, i) => i !== index
                                );
                                setProcesses(newProcesses);
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      className="px-3 py-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded transition-colors"
                      onClick={() => setProcesses([...processes, ""])}
                    >
                      <Plus /> Add Processes
                    </button>
                  </div>
                </div>
              </div>
              {/* Resources Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
                  </div>

                  {/* Table Header */}
                  <div className="hidden sm:grid grid-cols-6 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Resource ID</div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Specification</div>
                    <div>Comment</div>
                    <div>Action</div>
                  </div>

                  {/* Rows */}
                  <div className="border border-t-0 border-gray-300">
                    {selectedResources.map((resource, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-6 gap-4 px-3 py-4 items-start sm:items-center bg-white border-b border-gray-200 last:border-b-0"
                      >
                        {/* Resource ID */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Resource ID
                          </label>
                          <input
                            type="text"
                            value={resource?.customId || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                       
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Resource Name
                          </label>
                          <Select
                            options={resourceOptions}
                            value={resource.name} 
                            placeholder="Select Resource Name"
                            className="text-sm"
                            onChange={(selectedOption) => {
                              setSelectedResources((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  customId: selectedOption.customId,
                                  name: selectedOption,
                                  type: { label: selectedOption.type, value: selectedOption.type },
                                  specification: {
                                    label: selectedOption.specification,
                                    value: selectedOption.specification,
                                  },
                                };
                                return updated;
                              });
                            }}
                          />
                        </div>

                        {/* Type */}
                        <div>
                          <input
                            value={resource.type?.value || ""}
                            placeholder="Resource Type"
                            disabled
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Specification */}
                        <div>
                          <input
                            value={resource.specification?.value || ""}
                            placeholder="Resource Specification"
                            disabled
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <input
                            type="text"
                            value={resource.comment || ""}
                            onChange={(e) => {
                              const updated = [...selectedResources];
                              updated[index].comment = e.target.value;
                              setSelectedResources(updated);
                            }}
                            placeholder="Comment"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        {/* Action */}
                        <div className="flex sm:justify-center items-center gap-2">
                          {selectedResources.length > 1 && (
                            <button
                              type="button"
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                              onClick={() => {
                                const updated = selectedResources.filter((_, i) => i !== index);
                                setSelectedResources(updated);
                              }}
                            >
                              ✕
                            </button>
                          )}
                          {index === selectedResources.length - 1 && (
                            <button
                              type="button"
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded transition-colors"
                              onClick={() =>
                                setSelectedResources([
                                  ...selectedResources,
                                  { name: null, type: null, specification: null, comment: "" },
                                ])
                              }
                            >
                              + Add Resources
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* Manpower Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Manpower</h3>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    Available manpower: <span className="font-medium">{manpowerCount}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={manpowerInput}
                      onChange={(e) => setManpowerInput(e.target.value)}
                      placeholder={manpowerCount?.toString() || "0"}
                      className="w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-500">(Leave empty to send available count)</span>
                  </div>
                </div>
              </div>





              {/* Scrap Materials Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scrap Materials
                    </h3>
                  </div>

                  {/* Table Header (Desktop Only) */}
                  <div className="hidden sm:grid grid-cols-7 gap-1 bg-gradient-to-r from-blue-500 whitespace-nowrap to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Product Name</div>
                    <div>Estimated Quantity</div>
                    <div className="ml-5">UOM</div>
                    <div>Comment</div>
                    <div>Unit Cost</div>
                    <div>Total Part Cost</div>
                    <div>Action</div>
                  </div>

                  {/* Rows */}
                  <div className="border border-t-0 border-gray-300">
                    {scrapMaterials.map((material, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-7 gap-4 px-3 py-4 items-start sm:items-center bg-white border-b border-gray-200 last:border-b-0"
                      >
                        {/* Product Name */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Product Name
                          </label>
                          <Select
                            styles={customStyles}
                            className="text-sm"
                            options={rawMaterialsOptions}
                            placeholder="Select"
                            value={material.item_name}
                            onChange={(d) => {
                              const newMaterials = [...scrapMaterials];
                              newMaterials[index].item_name = d;
                              const product = products.find(
                                (p) => p._id === d?.value
                              );
                              if (product) {
                                newMaterials[index].unit_cost = product.price;
                                newMaterials[index].uom = product.uom;
                                if (material.quantity) {
                                  newMaterials[index].total_part_cost =
                                    product.price * +material.quantity;
                                }
                              }
                              setScrapMaterials(newMaterials);
                            }}
                          />
                        </div>



                        {/* Estimated Quantity */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Estimated Quantity
                          </label>
                          <input
                            required
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={material.quantity || ""}
                            onChange={(e) => {
                              const newMaterials = [...scrapMaterials];
                              newMaterials[index].quantity = e.target.value;
                              if (material.unit_cost && e.target.value) {
                                newMaterials[index].total_part_cost =
                                  +material.unit_cost * +e.target.value;
                              }
                              setScrapMaterials(newMaterials);
                            }}
                            placeholder="0"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        {/* Comment */}

                        {/* UOM */}
                        <div>
                          <label className="sm:hidden  text-xs font-semibold text-gray-700">
                            UOM
                          </label>
                          <input
                            type="text"
                            value={material.uom || ""}
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Comment
                          </label>
                          <input
                            type="text"
                            value={material.description || ""}
                            onChange={(e) => {
                              const newMaterials = [...scrapMaterials];
                              newMaterials[index].description = e.target.value;
                              setScrapMaterials(newMaterials);
                            }}
                            placeholder="Comment"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        {/* Unit Cost */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Unit Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.unit_cost || ""
                                : material.unit_cost
                                  ? "*****"
                                  : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Total Part Cost */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Total Part Cost
                          </label>
                          <input
                            type={cookies?.role === "admin" ? "number" : "text"}
                            value={
                              cookies?.role === "admin"
                                ? material.total_part_cost || ""
                                : material.total_part_cost
                                  ? "*****"
                                  : ""
                            }
                            readOnly
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          />
                        </div>

                        {/* Action */}
                        {/* <div className="flex justify-center items-center">
                          <label className="sm:hidden text-xs font-semibold text-gray-700 block mb-1">
                            Remove
                          </label>
                          {scrapMaterials.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newMaterials = scrapMaterials.filter(
                                  (_, i) => i !== index
                                );
                                setScrapMaterials(newMaterials);
                              }}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div> */}

                        <div className="flex sm:justify-center items-center gap-2">
                          {scrapMaterials.length > 1 && (
                            <button
                              type="button"
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                              onClick={() => {
                                const newMaterials = scrapMaterials.filter(
                                  (_, i) => i !== index
                                );
                                setScrapMaterials(newMaterials);
                              }}
                            >
                              ✕
                            </button>
                          )}
                          <button
                            type="button"
                            className="px-3 py-1.5 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 whitespace-nowrap to-blue-500 text-white text-sm rounded transition-colors"
                            onClick={() =>
                              setScrapMaterials([
                                ...scrapMaterials,
                                {
                                  item_name: "",
                                  description: "",
                                  quantity: "",
                                  uom: "",
                                  unit_cost: "",
                                  total_part_cost: "",
                                },
                              ])
                            }
                          >
                            <Plus size={16} /> Add SM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charges Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Charges
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {/* Labour Charges */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Labour Charges
                      </label>
                      <input
                        type="number"
                        value={labourCharges || ""}
                        onChange={(e) => setLabourCharges(+e.target.value)}
                        placeholder="Labour Charges"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    {/* Machinery Charges */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Machinery Charges
                      </label>
                      <input
                        type="number"
                        value={machineryCharges || ""}
                        onChange={(e) => setMachineryCharges(+e.target.value)}
                        placeholder="Machinery Charges"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    {/* Electricity Charges */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Electricity Charges
                      </label>
                      <input
                        type="number"
                        value={electricityCharges || ""}
                        onChange={(e) => setElectricityCharges(+e.target.value)}
                        placeholder="Electricity Charges"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    {/* Other Charges */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Charges
                      </label>
                      <input
                        type="number"
                        value={otherCharges || ""}
                        onChange={(e) => setOtherCharges(+e.target.value)}
                        placeholder="Other Charges"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BOM Summary Section */}
              <div className="bg-white">
                <div className="px-4 py-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {/* BOM Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BOM Name *
                      </label>
                      <input
                        type="text"
                        value={bomName || ""}
                        onChange={(e) => setBomName(e.target.value)}
                        placeholder="Enter BOM Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        required
                      />
                    </div>

                    {/* Parts Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parts Count *
                      </label>
                      <input
                        type="number"
                        value={partsCount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
                      />
                    </div>

                    {/* Total Parts Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Parts Cost *
                      </label>
                      <input
                        type={cookies?.role === "admin" ? "number" : "text"}
                        value={
                          cookies?.role === "admin"
                            ? totalPartsCost || ""
                            : totalPartsCost
                              ? "*****"
                              : ""
                        }
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-sm"
                      />
                    </div>
                    <div className="mb-4 flex flex-col flex-1">
                      <label
                        htmlFor="remarks"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Remarks
                      </label>
                      <textarea
                        id="remarks"
                        name="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter remarks..."
                        rows={4}
                        className="w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded transition-colors duration-200 text-sm"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBom;
