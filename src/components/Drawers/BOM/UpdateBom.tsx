import { BiX } from "react-icons/bi";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useUpdateBOMMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";
import { Plus, Trash2 } from "lucide-react";

interface UpdateBomProps {
  closeDrawerHandler: () => void;
  fetchBomsHandler: () => void;
  bomId: string | undefined;
}

const UpdateBom: React.FC<UpdateBomProps> = ({
  closeDrawerHandler,
  fetchBomsHandler,
  bomId,
}) => {
  const [cookies] = useCookies();
  const [isLoadingBom, setIsLoadingBom] = useState<boolean>(false);

  const [bomName, setBomName] = useState<string | undefined>();
  const [partsCount, setPartsCount] = useState<number>(0);
  const [totalPartsCost, setTotalPartsCost] = useState<number>(0);

  const [finishedGood, setFinishedGood] = useState<
    { value: string; label: string } | undefined
  >();
  const [unitCost, setUnitCost] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number | undefined>();
  const [uom, setUom] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const supportingDoc = useRef<HTMLInputElement | null>(null);
  const [comments, setComments] = useState<string | undefined>();
  const [cost, setCost] = useState<number | undefined>();
  const [finishedGoodsOptions, setFinishedGoodsOptions] = useState<{ value: string; label: string }[]>([]);
  const [rawMaterialsOptions, setRawMaterialsOptions] = useState<{ value: string; label: string }[]>([]);
  const [processes, setProcesses] = useState<string[]>([""]);

  const [products, setProducts] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<string>("");
  const [scarpMaterials, setscarpMaterials] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [updateBom] = useUpdateBOMMutation();

  const [labourCharges, setLabourCharges] = useState<number | undefined>();
  const [machineryCharges, setMachineryCharges] = useState<
    number | undefined
  >();
  const [electricityCharges, setElectricityCharges] = useState<
    number | undefined
  >();
  const [otherCharges, setOtherCharges] = useState<number | undefined>();
  // Resources & Manpower states
  const [resources, setResources] = useState<any[]>([]);
  const [resourceOptions, setResourceOptions] = useState<{ value: string; label: string }[]>([]);
  type OptionType = {
    value: string;
    label: string;
    type?: string;
    specification?: string;
    customId?: string;
  };

  type ResourceRow = { name: OptionType | null; type: OptionType | null; specification: string; comment: string, customId: string; };


  const [selectedResources, setSelectedResources] = useState<ResourceRow[]>([
    { name: null, type: null, specification: "", comment: "", customId: "" },
  ]);


  // Manpower rows state
  const [selectedManpower, setSelectedManpower] = useState<
    { employee: { value: string; label: string } | null; role: string; hours: string }[]
  >([
    { employee: null, role: "", hours: "" }
  ]);

  const [empData, setEmpData] = useState<any[]>([]);
  const [manPowerOptions, setManPowerOptions] = useState<{ value: string; label: string }[]>([]);
  const [manpowerInput, setManpowerInput] = useState<string>("");
  const [manpowerCount, setManpowerCount] = useState<number>(0);

  const [rawMaterials, setRawMaterials] = useState<any[]>([
    {
      _id: "",
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

  const [scrapMaterials, setScrapMaterials] = useState<any[]>([
    {
      _id: "",
      item_name: "",
      description: "",
      quantity: "",
      uom: "",
      unit_cost: "",
      total_part_cost: "",
    },
  ]);

  // ---------- Helpers ----------

  const addRawMaterial = () => {
    setRawMaterials([
      ...rawMaterials,
      {
        _id: "",
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
  };

  const removeRawMaterial = (index: number) => {
    if (rawMaterials.length > 1) {
      setRawMaterials(rawMaterials.filter((_, i) => i !== index));
    }
  };

  const updateRawMaterial = (index: number, field: string, value: any) => {
    const updatedMaterials = [...rawMaterials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };

    if (field === "quantity" || field === "unit_cost") {
      const quantity = parseFloat(updatedMaterials[index].quantity) || 0;
      const unitCost = parseFloat(updatedMaterials[index].unit_cost) || 0;
      updatedMaterials[index].total_part_cost = (
        quantity * unitCost
      ).toString();
    }

    setRawMaterials(updatedMaterials);
  };

  const addScrapMaterial = () => {
    setScrapMaterials([
      ...scrapMaterials,
      {
        _id: "",
        item_name: "",
        description: "",
        quantity: "",
        uom: "",
        unit_cost: "",
        total_part_cost: "",
      },
    ]);
  };

  const removeScrapMaterial = (index: number) => {
    if (scrapMaterials.length > 1) {
      setScrapMaterials(scrapMaterials.filter((_, i) => i !== index));
    }
  };

  const updateScrapMaterial = (index: number, field: string, value: any) => {
    const updatedMaterials = [...scrapMaterials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };

    if (field === "quantity" || field === "unit_cost") {
      const quantity = parseFloat(updatedMaterials[index].quantity) || 0;
      const unitCost = parseFloat(updatedMaterials[index].unit_cost) || 0;
      updatedMaterials[index].total_part_cost = (
        quantity * unitCost
      ).toString();
    }

    setScrapMaterials(updatedMaterials);
  };

  const onFinishedGoodChangeHandler = (d: any) => {
    setFinishedGood(d);
    const product: any = products.filter((prd: any) => prd._id === d.value)[0];
    setCategory(product.category);
    setUom(product.uom);
    setUnitCost(product.price);
    if (quantity) {
      setCost(product.price * +quantity);
    }
  };

  const onFinishedGoodQntyChangeHandler = (qty: number) => {
    setQuantity(qty);
    if (unitCost) {
      setCost(+unitCost * qty);
    }
  };

  // ---------- API ----------

  const fetchBomDetails = async () => {
    if (!bomId) return;
    try {
      setIsLoadingBom(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `bom/${bomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      // console.log(data)
      setBomName(data.bom.bom_name);
      setPartsCount(data.bom.parts_count);
      setTotalPartsCost(data.bom.total_cost);
      setFinishedGood({
        value: data.bom.finished_good.item._id,
        label: data.bom.finished_good.item.name,
      });
      setDescription(data.bom.finished_good.description);
      setQuantity(data.bom.finished_good.quantity);
      setCost(data.bom.finished_good.cost);
      setUnitCost(data.bom.finished_good.item.price);
      setUom(data.bom.finished_good.item.uom);
      setCategory(data.bom.finished_good.item.category);
      setComments(data.bom.finished_good.comments);
      setRemarks(data?.bom?.remarks)
      setProcesses(data.bom.processes || [""]);
      setSelectedResources(
        data.bom.resources?.length
          ? data.bom.resources.map((r: any) => ({
            name: r.resource_id ? { value: r.resource_id._id, label: r.resource_id.name } : null,
            type: r.type ? { value: r.type, label: r.type } : null,
            specification: r.specification || "",
            comment: r.comment || "",
            customId: r.resource_id?.customId || "",   // <-- add this
          }))
          : [{ name: null, type: null, specification: "", comment: "", customId: "" }]
      );

      setManpowerCount(data.bom.manpower?.[0]?.number || empData?.length || 0);

      setManpowerInput(data.bom.manpower?.[0]?.number || "");

      const inputs: any = [];
      data.bom.raw_materials.forEach((material: any) => {
        inputs.push({
          _id: material._id,
          item_name: { value: material.item._id, label: material.item.name },
          description: material.description,
          quantity: material.quantity,
          uom: material.item.uom,
          category: material.item.category,
          assembly_phase: {
            value: material?.assembly_phase,
            label: material?.assembly_phase,
          },
          supplier: {
            value: material?.supplier?._id,
            label: material?.supplier?.name,
          },
          supporting_doc: "",
          comments: material?.comments,
          unit_cost: material.item.price,
          total_part_cost: material.total_part_cost,
        });
      });
      setRawMaterials(inputs);

      const scrap: any = [];
      data.bom?.scrap_materials?.forEach((material: any) => {
        scrap.push({
          _id: material._id,
          item_name: { value: material.item._id, label: material.item.name },
          description: material.description,
          quantity: material.quantity,
          uom: material.item.uom,
          unit_cost: material.item.price,
          total_part_cost: material.total_part_cost,
        });
      });
      setScrapMaterials(scrap);

      setLabourCharges(data.bom?.other_charges?.labour_charges);
      setMachineryCharges(data.bom?.other_charges?.machinery_charges);
      setElectricityCharges(data.bom?.other_charges?.electricity_charges);
      setOtherCharges(data.bom?.other_charges?.other_charges);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingBom(false);
    }
  };

  const fetchProductsHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/all",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
        }
      );
      const results = await response.json();
      if (!results.success) throw new Error(results?.message);
      setProducts(results.products);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const updateBomHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const fileInput = supportingDoc.current as HTMLInputElement;
    let pdfUrl;
    if (fileInput && fileInput?.files && fileInput.files.length > 0) {
      try {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        const uploadedFileResponse = await fetch(
          process.env.REACT_APP_FILE_UPLOAD_URL!,
          {
            method: "POST",
            body: formData as unknown as BodyInit,
          }
        );
        const uploadedFile: any = await uploadedFileResponse.json();
        if (uploadedFile?.error) throw new Error(uploadedFile?.error);
        pdfUrl = uploadedFile[0];
      } catch (err: any) {
        toast.error(err.message || "Something went wrong during file upload");
        return;
      }
    }

    let modifiedRawMaterials = rawMaterials.map((material) => {
      const materialData: any = {
        item: material?.item_name?.value,
        description: material?.description,
        quantity: material?.quantity,
        uom: material?.uom,
        unit_cost: material?.unit_cost,
        category: material?.category,
        assembly_phase: material?.assembly_phase?.value,
        supplier: material?.supplier?.value,
        supporting_doc: material?.supporting_doc,
        comments: material?.comments,
        total_part_cost: material?.total_part_cost,
      };
      if (material?._id && material._id.trim() !== "") {
        materialData._id = material._id;
      }
      return materialData;
    });

    let modifiedScrapMaterials =
      scrapMaterials?.[0]?.item_name &&
      scrapMaterials?.map((material) => {
        const materialData: any = {
          item: material?.item_name?.value,
          description: material?.description,
          quantity: material?.quantity,
          uom: material?.uom,
          unit_cost: material?.unit_cost,
          total_part_cost: material?.total_part_cost,
        };
        if (material?._id && material._id.trim() !== "") {
          materialData._id = material._id;
        }
        return materialData;
      });


    const body = {
      _id: bomId,
      raw_materials: modifiedRawMaterials,
      scrap_materials: modifiedScrapMaterials,
      processes: processes,
      finished_good: {
        item: finishedGood?.value,
        description: description,
        quantity: quantity,
        uom: uom,
        category: category,
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
      remarks: remarks,
      manpower: [{ number: String(manpowerInput || manpowerCount) }],
      resources: selectedResources.map((r) => ({
        resource_id: r.name?.value,
        type: r.type?.value || r.type,
        specification: r.specification,
        comment: r.comment || "",
        customId: r.customId,
      })),





    };

    try {
      const response = await updateBom(body).unwrap();
      toast.success(response?.message);
      fetchBomsHandler();
      closeDrawerHandler();
    } catch (error: any) {
      if (error?.data?.message?.includes("Insufficient stock")) {
        fetchBomsHandler();
        closeDrawerHandler();
      }
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  console.log(manpowerCount)

  // ---------- Effects ----------
  const fetchResourceHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "resources",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
        }
      );
      const results = await response.json();
      if (!results.success) throw new Error(results?.message);
      setResources(results.resources);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const fetchEmployeeHandler = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "auth/all",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${cookies?.access_token}` },
        }
      );
      const results = await response.json();
      if (!results.success) throw new Error(results?.message);

      const manPowerUsers = results?.users?.filter(
        (user: any) => user.role?.role?.toLowerCase().includes("man power")
      );

      setEmpData(manPowerUsers);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };


  useEffect(() => {
    fetchBomDetails();
    fetchProductsHandler();
    fetchResourceHandler();
    fetchEmployeeHandler();
  }, [bomId]);

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
    const scarpMaterialsOptions = products
      .filter((prd) => prd.category === "raw materials")
      .map((prd) => ({
        value: prd._id,
        label: prd.name,
      }));
    setscarpMaterials(scarpMaterialsOptions)
    setFinishedGoodsOptions(finishedGoodsOptions);
    setRawMaterialsOptions(rawMaterialsOptions);
  }, [products]);

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
    const options: OptionType[] = resources?.map((res: any) => ({
      label: res.name,
      value: res._id,
      type: res.type,
      specification: res.specification,
      customId: res.customId,
    }));
    setResourceOptions(options);
  }, [resources]);


  // ---------- Styles ----------

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

  // ---------- UI ----------

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 text-black flex border items-center justify-between">
            <h2 className="text-xl font-semibold">Update BOM</h2>
            <button
              onClick={closeDrawerHandler}
              className="p-1 border rounded transition-colors duration-200"
            >
              <BiX size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <form onSubmit={updateBomHandler}>
              {/* Basic Info */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        BOM Name
                      </label>
                      <input
                        type="text"
                        value={bomName || ""}
                        onChange={(e) => setBomName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="BOM Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parts Count
                      </label>
                      <input
                        type="number"
                        value={partsCount || 0}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Parts Cost
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
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Finished Good Section */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Finished Good
                  </h3>

                  {/* Header (Desktop) */}
                  <div className="hidden sm:grid grid-cols-7 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Finished Goods</div>
                    <div>Quantity</div>
                    <div>UOM</div>
                    <div>Category</div>
                    <div>Comments</div>
                    <div>Unit Cost</div>
                    <div>Cost</div>
                  </div>

                  {/* Row */}
                  <div className="border border-t-0 border-gray-300">
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 px-3 py-4 sm:items-center bg-white">
                      {/* Product */}
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
                          required
                        />
                      </div>

                      {/* Qty */}
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
                      <div>
                        <label className="sm:hidden text-xs font-semibold text-gray-700">
                          Category
                        </label>
                        <input
                          type="text"
                          value={category || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                        />
                      </div>

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

              {/* Raw Materials */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Raw Materials
                    </h3>
                  </div>

                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-8 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Product Name</div>
                    <div>Quantity</div>
                    <div>UOM</div>
                    <div>Category</div>
                    <div>Comments</div>
                    <div>Unit Cost</div>
                    <div>Total Part Cost</div>
                    <div>Action</div>
                  </div>

                  {/* Rows */}
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
                            onChange={(d: any) => {
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
                            type="number"
                            value={material.quantity || ""}
                            onChange={(e) =>
                              updateRawMaterial(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
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

                        {/* Category */}
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
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Comments
                          </label>
                          <input
                            type="text"
                            value={material.comments || ""}
                            onChange={(e) =>
                              updateRawMaterial(
                                index,
                                "comments",
                                e.target.value
                              )
                            }
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
                          <button
                            type="button"
                            className="inline-flex items-center justify-center px-2 py-1 text-red-600 hover:text-red-800"
                            onClick={() => removeRawMaterial(index)}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 whitespace-nowrap flex justify-center items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded transition-colors"
                            onClick={addRawMaterial}
                          >
                            <Plus size={16} /> Add RM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Processes */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Processes
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {processes.map((proc, idx) => (
                      <div className="border rounded-md p-3" key={idx}>
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row gap-2 sm:items-center"
                        >
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Process {idx + 1}
                          </label>
                          <input
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder={`Process ${idx + 1}`}
                            value={proc}
                            onChange={(e) => {
                              const next = [...processes];
                              next[idx] = e.target.value;
                              setProcesses(next);
                            }}
                          />
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 sm:ml-2"
                            onClick={() => {
                              if (processes.length <= 1) return;
                              setProcesses(
                                processes.filter((_, i) => i !== idx)
                              );
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => setProcesses([...processes, ""])}
                      className="px-3 py-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded transition-colors"
                    >
                      <Plus size={16} /> Add Process
                    </button>
                  </div>
                </div>
              </div>
              {/* Resources */}
              <div className="bg-white border-b px-4 py-4 sm:px-6">
                {/* Resources Section */}
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

                </div>

                {/* Rows */}
                {/* Resource Rows */}
                <div className="border border-t-0 border-gray-300">
                  {selectedResources.map((res, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-6 gap-4 px-3 py-4 items-start sm:items-center bg-white border-b border-gray-200 last:border-b-0"
                    >
                      {/* Resource ID */}
                      <div>
                        <input
                          type="text"
                          value={res.customId || ""}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          placeholder="Resource ID"
                        />
                      </div>

                      {/* Resource Name */}
                      <div>
                        <Select
                          options={resourceOptions}
                          value={res.name}
                          onChange={(selected) => {
                            const updated = [...selectedResources];
                            updated[index] = {
                              ...updated[index],
                              name: selected ? { value: selected.value, label: selected.label } : null,
                              customId: selected?.customId || "",
                              type: selected?.type
                                ? { label: selected.type, value: selected.type }
                                : null,
                              specification: selected?.specification || "",
                            };
                            setSelectedResources(updated);
                          }}
                          placeholder="Select Resource"
                          className="text-sm"
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                          placeholder="Type"
                          value={res.type?.label || ""}
                          readOnly
                        />
                      </div>

                      {/* Specification */}
                      <div>
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Specification"
                          value={res.specification}
                          onChange={(e) => {
                            const updated = [...selectedResources];
                            updated[index].specification = e.target.value;
                            setSelectedResources(updated);
                          }}
                        />
                      </div>

                      {/* Comment */}
                      <div>
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Comment"
                          value={res.comment}
                          onChange={(e) => {
                            const updated = [...selectedResources];
                            updated[index].comment = e.target.value;
                            setSelectedResources(updated);
                          }}
                        />
                      </div>

                      {/* Action */}
                      <div className="flex sm:justify-center items-center gap-2">
                        {selectedResources.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedResources(selectedResources.filter((_, i) => i !== index))
                            }
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Resource Button — placed BELOW all rows */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedResources([
                        ...selectedResources,
                        { name: null, type: null, specification: "", comment: "", customId: "" },
                      ])
                    }
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Resource
                  </button>
                </div>




              </div>


              {/* Manpower Data */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manpower</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available manpower
                    </label>
                    <input
                      type="number"
                      value={manpowerInput || manpowerCount || ""}
                      onChange={(e) => setManpowerInput(e.target.value)}
                      placeholder="Enter manpower count"
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>


              {/* Scrap Materials */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scrap Materials
                    </h3>
                  </div>

                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-7 gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm font-semibold uppercase tracking-wider px-3 py-2">
                    <div>Product Name</div>
                    <div>Comment</div>
                    <div>Estimated Quantity</div>
                    <div>UOM</div>
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
                            options={scarpMaterials}
                            placeholder="Select"
                            value={material.item_name}
                            onChange={(d: any) => {
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

                        {/* Comment */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Comment
                          </label>
                          <input
                            type="text"
                            value={material.description || ""}
                            onChange={(e) =>
                              updateScrapMaterial(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Comment"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>

                        {/* Estimated Quantity */}
                        <div>
                          <label className="sm:hidden text-xs font-semibold text-gray-700">
                            Estimated Quantity
                          </label>
                          <input
                            type="number"
                            value={material.quantity || ""}
                            onChange={(e) =>
                              updateScrapMaterial(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            placeholder="Quantity"
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
                          <button
                            type="button"
                            className="inline-flex items-center justify-center px-2 py-1 text-red-600 hover:text-red-800"
                            onClick={() => removeScrapMaterial(index)}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 flex  justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-sm rounded transition-colors"
                            onClick={addScrapMaterial}
                          >
                            <Plus size={16} /> Add SM
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Charges */}
              <div className="bg-white border-b">
                <div className="px-4 py-4 sm:px-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Other Charges
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Labour Charges
                      </label>
                      <input
                        type="number"
                        value={labourCharges || 0}
                        onChange={(e) => setLabourCharges(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Machinery Charges
                      </label>
                      <input
                        type="number"
                        value={machineryCharges || 0}
                        onChange={(e) => setMachineryCharges(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Electricity Charges
                      </label>
                      <input
                        type="number"
                        value={electricityCharges || 0}
                        onChange={(e) => setElectricityCharges(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Charges
                      </label>
                      <input
                        type="number"
                        value={otherCharges || 0}
                        onChange={(e) => setOtherCharges(+e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
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
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="Enter remarks..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="px-4 py-4 sm:px-6 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={closeDrawerHandler}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Update BOM
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateBom;
