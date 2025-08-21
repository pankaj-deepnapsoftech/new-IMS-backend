import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useAddProductMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";

interface AddProductProps {
  closeDrawerHandler: () => void;
  fetchProductsHandler: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({
  closeDrawerHandler,
  fetchProductsHandler,
}) => {
  const [name, setName] = useState<string | undefined>();
  const [id, setId] = useState<string | undefined>();
  const [uom, setUom] = useState<
    { value: string; label: string } | undefined
  >();
  const [category, setCategory] = useState<
    { value: string; label: string } | undefined
  >();
  const [currentStock, setCurrentStock] = useState<string | undefined>();
  const [price, setPrice] = useState<string | undefined>();
  const [regularBuyingPrice, setRegularBuyingPrice] = useState<
    number | undefined
  >();
  const [wholesaleBuyingPrice, setWholeSaleBuyingPrice] = useState<
    number | undefined
  >();
  const [mrp, setMrp] = useState<number | undefined>();
  const [dealerPrice, setDealerPrice] = useState<number | undefined>();
  const [distributorPrice, setDistributorPrice] = useState<
    number | undefined
  >();
  const [minStock, setMinStock] = useState<string | undefined>();
  const [maxStock, setMaxStock] = useState<string | undefined>();
  const [hsn, setHsn] = useState<string | undefined>();
  const [itemType, setItemType] = useState<
    { value: string; label: string } | undefined
  >();
  const [subCategory, setSubCategory] = useState<string | undefined>();
  const [productOrService, setProductOrService] = useState<
    { value: string; label: string } | undefined
  >();
  const [store, setStore] = useState<
    { value: string; label: string } | undefined
  >();
  const [storeOptions, setStoreOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [cookies] = useCookies();
  const [inventoryCategory, setInventoryCategory] = useState<
    { value: string; label: string } | undefined
  >();
  // const [category, setCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [showNewUOMInput, setShowNewUOMInput] = useState(false);
  const [colorName, setColorName] = useState<string | undefined>();
  const [uomOptions, setUomOptions] = useState([
    { value: "pcs", label: "pcs" },
    { value: "kgs", label: "kgs" },
    { value: "g", label: "g" },
    { value: "mg", label: "mg" },
    { value: "ltr", label: "ltr" },
    { value: "ml", label: "ml" },
    { value: "tonne", label: "tonne" },
    { value: "cm", label: "cm" },
    { value: "mm", label: "mm" },
    { value: "inch", label: "inch" },
    { value: "ft", label: "ft" },
    { value: "mtr", label: "mtr" },
    { value: "sqft", label: "sqft" },
    { value: "sqm", label: "sqm" },
    { value: "cbm", label: "cbm" },
    { value: "cft", label: "cft" },
    { value: "dozen", label: "dozen" },
    { value: "pack", label: "pack" },
    { value: "set", label: "set" },
    { value: "roll", label: "roll" },
    { value: "box", label: "box" },
    { value: "bag", label: "bag" },
    { value: "pair", label: "pair" },
    { value: "sheet", label: "sheet" },
    { value: "tube", label: "tube" },
    { value: "bottle", label: "bottle" },
    { value: "container", label: "container" },
  ]);

  // const inventoryCategoryOptions = [
  //   { value: "direct", label: "Direct" },
  //   { value: "indirect", label: "Indirect" },
  // ];
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "finished goods", label: "Finished Goods" },
    { value: "raw materials", label: "Raw Materials" },
    { value: "semi finished goods", label: "Semi Finished Goods" },
    { value: "consumables", label: "Consumables" },
    { value: "bought out parts", label: "Bought Out Parts" },
    { value: "trading goods", label: "Trading Goods" },
    { value: "service", label: "Service" },
  ])
  

  // const categoryOptions = [
  //   { value: "finished goods", label: "Finished Goods" },
  //   { value: "raw materials", label: "Raw Materials" },
  //   { value: "semi finished goods", label: "Semi Finished Goods" },
  //   { value: "consumables", label: "Consumables" },
  //   { value: "bought out parts", label: "Bought Out Parts" },
  //   { value: "trading goods", label: "Trading Goods" },
  //   { value: "service", label: "Service" },
  // ];

  const itemTypeOptions = [
    { value: "buy", label: "Buy" },
    { value: "sell", label: "Sell" },
    { value: "both", label: "Both" },
  ];

  const productOrServiceOptions = [
    { value: "product", label: "Product" },
    { value: "service", label: "Service" },
  ];

  // const uomOptions = [
  //   { value: "pcs", label: "pcs" },           // pieces
  //   { value: "kgs", label: "kgs" },           // kilograms
  //   { value: "g", label: "g" },               // grams
  //   { value: "mg", label: "mg" },             // milligrams
  //   { value: "ltr", label: "ltr" },           // liters
  //   { value: "ml", label: "ml" },             // milliliters
  //   { value: "tonne", label: "tonne" },       // metric ton
  //   { value: "cm", label: "cm" },             // centimeters
  //   { value: "mm", label: "mm" },             // millimeters
  //   { value: "inch", label: "inch" },
  //   { value: "ft", label: "ft" },             // feet
  //   { value: "mtr", label: "mtr" },           // meters
  //   { value: "sqft", label: "sqft" },         // square feet
  //   { value: "sqm", label: "sqm" },           // square meters
  //   { value: "cbm", label: "cbm" },           // cubic meters
  //   { value: "cft", label: "cft" },           // cubic feet
  //   { value: "dozen", label: "dozen" },       // 12 pcs
  //   { value: "pack", label: "pack" },
  //   { value: "set", label: "set" },
  //   { value: "roll", label: "roll" },
  //   { value: "box", label: "box" },
  //   { value: "bag", label: "bag" },
  //   { value: "pair", label: "pair" },
  //   { value: "sheet", label: "sheet" },
  //   { value: "tube", label: "tube" },
  //   { value: "bottle", label: "bottle" },
  //   { value: "container", label: "container" },
  // ];

  const [addProduct] = useAddProductMutation();
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  const addProductHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(category )
    try {
      const response = await addProduct({
        name,
        inventory_category: "indirect",
        // product_id: id,
        uom: uom?.value,
        category: category?.value,
        min_stock: minStock,
        max_stock: maxStock,
        current_stock: currentStock,
        price: price,
        hsn,
        sub_category: subCategory,
        item_type: itemType?.value,
        product_or_service: productOrService?.value,
        regular_buying_price: regularBuyingPrice,
        wholesale_buying_price: wholesaleBuyingPrice,
        mrp: mrp,
        dealer_price: dealerPrice,
        distributor_price: distributorPrice,
        store: store?.value || undefined,
        color_name: colorName 
      }).unwrap();
      console.log(response)
      toast.success(response.message);
      fetchProductsHandler();
      closeDrawerHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const fetchAllStores = async () => {
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
      const modifiedStores = data.stores.map((store: any) => ({
        value: store._id,
        label: store.name,
      }));
      setStoreOptions(modifiedStores);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchAllStores();
  }, []);
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: "#d1d5db",
      color: "#374151",
      minHeight: "40px",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#e5e7eb" : "white",
      color: "#374151",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#e5e7eb",
      color: "#374151",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        backgroundColor: "#ef4444",
        color: "white",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "white",
      border: "1px solid #d1d5db",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
  };
  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[100vw]  bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Add Indirect Inventory 
        </h1>
        <button
          onClick={closeDrawerHandler}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            color: colors.text.secondary,
            backgroundColor: colors.gray[100],
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.gray[100];
          }}
        >
          <BiX size={20} />
        </button>
      </div>

      <div className="mt-8 px-5">
        <form onSubmit={addProductHandler}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Inventory Category
              </FormLabel>
              <Select
                styles={customStyles}
                value={inventoryCategory}
                options={inventoryCategoryOptions}
                onChange={(e: any) => setInventoryCategory(e)}
                required={true}
              />
            </FormControl> */}

            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Product Name
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Product Name"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Product Price (Default)
              </FormLabel>
              <Input
                value={price}
                className="no-scrollbar"
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                placeholder="Product Price"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Product/Service
              </FormLabel>                                          
              <Select
                styles={customStyles}
                value={productOrService}
                options={productOrServiceOptions}
                onChange={(e: any) => setProductOrService(e)}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="black">
                Inventory Type
              </FormLabel>

              <Select
                styles={customStyles}
                value={category}
                options={[...categoryOptions, { value: "__add_new__", label: "+ Add new Inventory Type" }]}
                onChange={(selected: any) => {
                  if (selected?.value === "__add_new__") {
                    const newType = prompt("Enter new Inventory Type (e.g. Packaging):")?.trim().toLowerCase();
                    if (!newType) {
                      toast.warning("Inventory type cannot be empty.");
                      return;
                    }

                    const exists = categoryOptions.some((opt) => opt.value === newType);
                    if (exists) {
                      toast.warning("This inventory type already exists.");
                      return;
                    }

                    const confirmed = window.confirm(`Are you sure you want to add "${newType}"?`);
                    if (!confirmed) return;

                    const newOption = { value: newType, label: newType };
                    setCategoryOptions((prev) => [...prev, newOption]);
                    setCategory(newOption);
                    toast.success(`Inventory Type "${newType}" added.`);
                  } else {
                    setCategory(selected);
                  }
                }}
                
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="black">
                UOM (Unit of Measurement)
              </FormLabel>

              <Select
                styles={customStyles}
                value={uom}
                options={[...uomOptions, { value: "__add_new__", label: "+ Add new UOM" }]}
                onChange={(selected: any) => {
                  if (selected?.value === "__add_new__") {
                    const newUnit = prompt("Enter new UOM (e.g. bundle):")?.trim().toLowerCase();
                    if (!newUnit) {
                      toast.warning("UOM cannot be empty.");
                      return;
                    }

                    const exists = uomOptions.some((opt) => opt.value === newUnit);
                    if (exists) {
                      toast.warning("This UOM already exists.");
                      return;
                    }

                    const confirmed = window.confirm(`Are you sure you want to add "${newUnit}" as a new UOM?`);
                    if (!confirmed) return;

                    const newOption = { value: newUnit, label: newUnit };
                    setUomOptions((prev) => [...prev, newOption]);
                    setUom(newOption);
                    toast.success(`UOM "${newUnit}" added.`);
                  } else {
                    setUom(selected);
                  }
                }}

              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Product Type
              </FormLabel>
              <Select
                styles={customStyles}
                value={itemType}
                options={itemTypeOptions}
                onChange={(e: any) => setItemType(e)}
              />
            </FormControl>
            
       

            <FormControl className="mt-3 mb-5" >
              <FormLabel fontWeight="bold" color="gray.700">
                Color Name
              </FormLabel>
              <Input
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                type="text"
                placeholder="Enter product color name"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Current Stock
              </FormLabel>
              <Input
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                type="number"
                placeholder="Current Stock"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Store
              </FormLabel>
              <Select
                styles={customStyles}
                value={store}
                options={storeOptions}
                onChange={(e: any) => setStore(e)}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Regular Buying Price
              </FormLabel>
              <Input
                value={regularBuyingPrice}
                className="no-scrollbar"
                onChange={(e) => setRegularBuyingPrice(+e.target.value)}
                type="number"
                placeholder="Regular Buying Price"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Wholesale Buying Price
              </FormLabel>
              <Input
                value={wholesaleBuyingPrice}
                className="no-scrollbar"
                onChange={(e) => setWholeSaleBuyingPrice(+e.target.value)}
                type="number"
                placeholder="Wholesale Buying Price"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                MRP
              </FormLabel>
              <Input
                value={mrp}
                className="no-scrollbar"
                onChange={(e) => setMrp(+e.target.value)}
                type="number"
                placeholder="MRP"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Dealer Price
              </FormLabel>
              <Input
                value={dealerPrice}
                className="no-scrollbar"
                onChange={(e) => setDealerPrice(+e.target.value)}
                type="number"
                placeholder="Dealer Price"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Distributor Price
              </FormLabel>
              <Input
                value={distributorPrice}
                className="no-scrollbar"
                onChange={(e) => setDistributorPrice(+e.target.value)}
                type="number"
                placeholder="Distributor Price"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
         

          

            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Product Subcategory
              </FormLabel>
              <Input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                type="text"
                placeholder="Product Subcategory"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
        
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Min Stock
              </FormLabel>
              <Input
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                type="number"
                placeholder="Min Stock"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Max Stock
              </FormLabel>
              <Input
                value={maxStock}
                onChange={(e) => setMaxStock(e.target.value)}
                type="number"
                placeholder="Max Stock"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                HSN
              </FormLabel>
              <Input
                value={hsn}
                onChange={(e) => setHsn(e.target.value)}
                type="text"
                placeholder="HSN"
                bg="white"
                borderColor="gray.300"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px #3182ce",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>
          
          </div>
          <Button
            isLoading={isAddingProduct}
            type="submit"
            className="mt-5"
            colorScheme="blue"
            size="md"
            width="full"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
