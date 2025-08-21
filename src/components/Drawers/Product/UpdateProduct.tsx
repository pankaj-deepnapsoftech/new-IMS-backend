import { Button, FormControl, FormLabel, Input, Checkbox } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useUpdateProductMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import { colors } from "../../../theme/colors";
import axios from "axios";

interface UpdateProductProps {
  closeDrawerHandler: () => void;
  fetchProductsHandler: () => void;
  productId: string | undefined;
}

const UpdateProduct: React.FC<UpdateProductProps> = ({
  closeDrawerHandler,
  productId,
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
  const [subCategory, setSubCategory] = useState<string | undefined>();
  const [currentStock, setCurrentStock] = useState<string | undefined>();
  const [price, setPrice] = useState<string | undefined>();
  const [minStock, setMinStock] = useState<string | undefined>();
  const [maxStock, setMaxStock] = useState<string | undefined>();
  const [hsn, setHsn] = useState<string | undefined>();
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
  const [store, setStore] = useState<
    { value: string; label: string } | undefined
  >();
  const [storeOptions, setStoreOptions] = useState<
    { value: string; label: string }[] | []
  >([]);

  const [cookies] = useCookies();

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

  const [updateProduct] = useUpdateProductMutation();
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState<boolean>(false);
  const [useShortageAdjustment, setUseShortageAdjustment] = useState<boolean>(true);
  const [originalStock, setOriginalStock] = useState<number>(0);

  const updateProductHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProduct(true);
      if (
        !name ||
        !id ||
        !uom ||
        !category ||
        !currentStock ||
        !price ||
        name.trim().length === 0 ||
        id.trim().length === 0 ||
        !uom
      ) {
        throw new Error("Please fill all the fileds");
      }

      // Check if stock has changed and if shortage adjustment is enabled
      const newStockValue = parseInt(currentStock);
      const stockChanged = newStockValue !== originalStock;

      if (stockChanged && useShortageAdjustment) {
        // Use the new stock and shortage adjustment endpoint
        try {
          const stockResponse = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}product/update-stock-and-shortages`,
            {
              productId: productId,
              newStock: newStockValue
            },
            {
              headers: { Authorization: `Bearer ${cookies?.access_token}` },
            }
          );

          if (stockResponse.data.success) {
            const { stockChange, shortageUpdate } = stockResponse.data;
            
            let message = `Stock updated from ${stockChange.oldStock} to ${stockChange.newStock}`;
            
            if (shortageUpdate) {
              if (shortageUpdate.removedShortages > 0) {
                message += `. ${shortageUpdate.removedShortages} shortage(s) resolved and removed.`;
              } else if (shortageUpdate.activeShortages > 0) {
                message += `. ${shortageUpdate.activeShortages} shortage(s) updated.`;
              }
              if (shortageUpdate.createdShortages > 0) {
                message += `. ${shortageUpdate.createdShortages} new shortage(s) created.`;
              }
            }
            
            toast.success(message);
          }
        } catch (stockError: any) {
          console.error("Error updating stock with shortages:", stockError);
          toast.error(stockError?.response?.data?.message || "Failed to update stock with shortages");
        }
      }

      // Update other product details using the regular endpoint
      const response = await updateProduct({
        _id: productId,
        name,
        product_id: id,
        uom: uom?.value,
        category: category?.value,
        sub_category: subCategory,
        min_stock: minStock,
        max_stock: maxStock,
        current_stock: currentStock,
        price: price,
        latest_price: price, // Update latest price when price is updated
        hsn,
        regular_buying_price: regularBuyingPrice,
        wholesale_buying_price: wholesaleBuyingPrice,
        mrp: mrp,
        dealer_price: dealerPrice,
        distributor_price: distributorPrice,
        store: store?.value || undefined,
      }).unwrap();
      
      if (!stockChanged || !useShortageAdjustment) {
        toast.success(response.message);
      }
      
      fetchProductsHandler();
      closeDrawerHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setIsLoadingProduct(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `product/${productId}`,
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
      setName(data.product.name);
      setId(data.product.product_id);
      setCategory({
        value: data.product.category,
        label: data.product.category,
      });
      setUom({ value: data.product.uom, label: data.product.uom });
      setPrice(data.product.price);
      setCurrentStock(data.product.current_stock);
      setOriginalStock(data.product.current_stock);
      setMinStock(data.product?.min_stock);
      setMaxStock(data.product?.max_stock);
      setHsn(data.product?.hsn);
      setSubCategory(data.product?.sub_category);
      setRegularBuyingPrice(data.product?.regular_buying_price);
      setWholeSaleBuyingPrice(data.product?.wholesale_buying_price);
      setMrp(data.product?.mrp);
      setDealerPrice(data.product?.dealer_price);
      setDistributorPrice(data.product?.distributor_price);
      if (data?.product?.store) {
        setStore({
          value: data.product.store._id,
          label: data.product.store.name,
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsLoadingProduct(false);
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
    fetchProductDetails();
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
          Update Product
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
        {isLoadingProduct && <Loading />}
        {!isLoadingProduct && (
          <form onSubmit={updateProductHandler}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="black">
                  Product ID
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  type="text"
                  placeholder="Product ID"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="black">
                  Product Name
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Product Name"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="black">
                  Product Price
                </FormLabel>
                <Input
                  value={price}
                  className="no-scrollbar text-gray-800 "
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  placeholder="Product Price"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Regular Buying Price
                </FormLabel>
                <Input
                  value={regularBuyingPrice}
                  className="no-scrollbar text-gray-800"
                  onChange={(e) => setRegularBuyingPrice(+e.target.value)}
                  type="number"
                  placeholder="Regular Buying Price"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Wholesale Buying Price
                </FormLabel>
                <Input
                  value={wholesaleBuyingPrice}
                  className="no-scrollbar text-gray-800"
                  onChange={(e) => setWholeSaleBuyingPrice(+e.target.value)}
                  type="number"
                  placeholder="Regular Buying Price"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  MRP
                </FormLabel>
                <Input
                  value={mrp}
                  className="no-scrollbar text-gray-800"
                  onChange={(e) => setMrp(+e.target.value)}
                  type="number"
                  placeholder="MRP"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Dealer Price
                </FormLabel>
                <Input
                  value={dealerPrice}
                  className="no-scrollbar text-gray-800"
                  onChange={(e) => setDealerPrice(+e.target.value)}
                  type="number"
                  placeholder="Dealer Price"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Distributor Price
                </FormLabel>
                <Input
                  value={distributorPrice}
                  className="no-scrollbar text-gray-800"
                  onChange={(e) => setDistributorPrice(+e.target.value)}
                  type="number"
                  placeholder="Distributor Price"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="black">
                  Product Category
                </FormLabel>
                <Select
                  styles={customStyles}
                  value={category}
                  options={categoryOptions}
                  onChange={(e: any) => setCategory(e)}
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Product Subcategory
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  type="text"
                  placeholder="Product Subcategory"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="black">
                  UOM (Unit of Measurement)
                </FormLabel>
                <Select
                  styles={customStyles}
                  value={uom}
                  options={uomOptions}
                  onChange={(e: any) => setUom(e)}
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="black">
                  Current Stock
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  type="number"
                  placeholder="Current Stock"
                />
                <div className="mt-2">
                  <Checkbox
                    isChecked={useShortageAdjustment}
                    onChange={(e) => setUseShortageAdjustment(e.target.checked)}
                    colorScheme="blue"
                    size="sm"
                  >
                    <span className="text-sm text-gray-600">
                      Auto-adjust shortages when stock changes
                    </span>
                  </Checkbox>
                </div>
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Min Stock
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  type="number"
                  placeholder="Min Stock"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Max Stock
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={maxStock}
                  onChange={(e) => setMaxStock(e.target.value)}
                  type="number"
                  placeholder="Max Stock"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  HSN
                </FormLabel>
                <Input
                  className="text-gray-800"
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                  type="text"
                  placeholder="HSN"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5">
                <FormLabel fontWeight="bold" color="black">
                  Store
                </FormLabel>
                <Select
                  styles={customStyles}
                  className="w-full rounded mt-2 border border-[#a9a9a9]"
                  options={storeOptions}
                  value={store}
                  onChange={(d: any) => setStore(d)}
                />
              </FormControl>
            </div>
            

            
            <div className="flex flex-col flex-1">
              <Button
                isLoading={isUpdatingProduct}
                type="submit"
                className="mt-1"
                color="white"
                backgroundColor="#000000"
                _hover={{ bg: "#000000" }}
                style={{
                  backgroundColor: colors.button.primary,
                  color: colors.text.inverse,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    colors.button.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.button.primary;
                }}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
