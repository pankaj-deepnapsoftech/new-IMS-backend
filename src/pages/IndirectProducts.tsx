import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Select from "react-select";
import { MdOutlineRefresh, MdAdd, MdFileDownload } from "react-icons/md";
import { AiFillFileExcel } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import SampleCSV from "../assets/csv/product-sample.csv";
import React, { useEffect, useRef, useState } from "react";
import {
  useDeleteProductMutation,
  useBulkDeleteProductsMutation,
  useProductBulkUploadIndirectMutation,
  useProductBulKUploadMutation,
} from "../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import ProductTable from "../components/Table/ProductTable";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddProductDrawer,
  closeProductDetailsDrawer,
  closeUpdateProductDrawer,
  openAddProductDrawer,
  openProductDetailsDrawer,
  openUpdateProductDrawer,
} from "../redux/reducers/drawersSlice";
import AddProduct from "../components/Drawers/Product/AddIndirectProduct";
import UpdateProduct from "../components/Drawers/Product/UpdateProduct";
import ProductDetails from "../components/Drawers/Product/ProductDetails";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import { Package } from "lucide-react";

const IndirectProducts: React.FC = () => {
  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("inventory");
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [productId, setProductId] = useState<string | undefined>(); // Product Id to be updated or deleted
  const [searchKey, setSearchKey] = useState<string | undefined>();
  const [filteredData, setFilteredData] = useState<any>([]);

  // Bulk upload menu
  const [showBulkUploadMenu, setShowBulkUploadMenu] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  // Filters
  const [productServiceFilter, setProductServiceFilter] = useState<string>("");
  const [storeOptions, setStoreOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [storeFilter, setStoreFilter] = useState<
    { value: string; label: string } | undefined
  >();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [bulkUploading, setBulkUploading] = useState<boolean>(false);

  const [bulkUpload] = useProductBulkUploadIndirectMutation();

  const {
    isAddProductDrawerOpened,
    isUpdateProductDrawerOpened,
    isProductDetailsDrawerOpened,
  } = useSelector((state: any) => state.drawers);
  const dispatch = useDispatch();

  const [deleteProduct] = useDeleteProductMutation();
  const [bulkDeleteProducts] = useBulkDeleteProductsMutation();

  const openAddProductDrawerHandler = () => {
    dispatch(openAddProductDrawer());
  };

  const closeProductDrawerHandler = () => {
    dispatch(closeAddProductDrawer());
  };

  const openUpdateProductDrawerHandler = (id: string) => {
    setProductId(id);
    dispatch(openUpdateProductDrawer());
  };

  const closeUpdateProductDrawerHandler = () => {
    dispatch(closeUpdateProductDrawer());
  };

  const openProductDetailsDrawerHandler = (id: string) => {
    setProductId(id);
    dispatch(openProductDetailsDrawer());
  };

  const closeProductDetailsDrawerHandler = () => {
    dispatch(closeProductDetailsDrawer());
  };

  const deleteProductHandler = async (id: string) => {
    try {
      const response: any = await deleteProduct({ _id: id }).unwrap();
      toast.success(response.message);
      fetchProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const bulkDeleteProductsHandler = async (productIds: string[]) => {
    try {
      const response: any = await bulkDeleteProducts(productIds).unwrap();
      toast.success(response.message);
      fetchProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const fetchProductsHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/all?category=indirect",
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
      setData(results.products);
      setFilteredData(results.products);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
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
      let modifiedStores = [{ value: "", label: "All" }];
      modifiedStores.push(
        ...data.stores.map((store: any) => ({
          value: store._id,
          label: store.name,
        }))
      );
      setStoreOptions(modifiedStores);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const bulkUploadHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const file = fileRef?.current?.files?.[0];
    if (!file) {
      toast.error("CSV file not selected");
      return;
    }

    try {
      setBulkUploading(true);
      const formData = new FormData();
      formData.append("excel", file);

      const response = await bulkUpload(formData).unwrap();
      toast.success(response.message);
      setShowBulkUploadMenu(false);
      fetchProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    } finally {
      setBulkUploading(false);
    }
  };
  const [productTypeFilter, setProductTypeFilter] = useState<string>("");

  const exportToExcelHandler = async () => {
    try {
      setIsExporting(true);

      // Build query parameters based on current filters
      const queryParams = new URLSearchParams();
      if (productTypeFilter) {
        queryParams.append("category", productTypeFilter);
      }

      const response = await fetch(
        `${
          process.env.REACT_APP_BACKEND_URL
        }product/exports/inexcel?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "indirect_products.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadSampleTemplate = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}product/exports/insample`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "indirect_products_sample_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Sample template downloaded!");
    } catch (error: any) {
      toast.error(error?.message || "Download failed");
    }
  };

  // Custom styles for react-select to match theme
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: colors.input.background,
      borderColor: state.isFocused
        ? colors.input.borderFocus
        : colors.input.border,
      borderRadius: "8px",
      minHeight: "44px",
      boxShadow: state.isFocused ? `0 0 0 3px ${colors.primary[100]}` : "none",
      "&:hover": {
        borderColor: colors.input.borderHover,
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? colors.primary[500]
        : state.isFocused
        ? colors.primary[50]
        : colors.input.background,
      color: state.isSelected ? colors.text.inverse : colors.text.primary,
      padding: "12px",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: colors.text.primary,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: colors.text.secondary,
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: colors.input.background,
      border: `1px solid ${colors.input.border}`,
      borderRadius: "8px",
      boxShadow: colors.shadow.lg,
    }),
  };

  useEffect(() => {
    fetchProductsHandler();
    fetchAllStores();
  }, []);

  useEffect(() => {
    const searchTxt = searchKey?.toLowerCase();
    // // @ts-ignore
    const results = data.filter(
      (prod: any) =>
        prod.product_or_service?.toLowerCase().includes(productServiceFilter) &&
        storeFilter &&
        (storeFilter?.value === "" ||
          prod?.store?._id === storeFilter?.value) &&
        (prod.name?.toLowerCase()?.includes(searchTxt) ||
          prod.product_id?.toLowerCase()?.includes(searchTxt) ||
          prod.category?.toLowerCase()?.includes(searchTxt) ||
          prod.price
            ?.toString()
            ?.toLowerCase()
            ?.toString()
            .includes(searchTxt) ||
          prod.uom?.toLowerCase()?.includes(searchTxt) ||
          prod.current_stock?.toString().toString().includes(searchTxt) ||
          prod?.min_stock?.toString()?.includes(searchTxt) ||
          prod?.max_stock?.toString()?.includes(searchTxt) ||
          prod?.hsn?.includes(searchTxt) ||
          (prod?.createdAt &&
            new Date(prod?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
          (prod?.updatedAt &&
            new Date(prod?.updatedAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              ?.reverse()
              ?.join("")
              ?.includes(searchTxt?.replaceAll("/", "") || "")))
    );
    setFilteredData(results);
  }, [searchKey, productServiceFilter, storeFilter]);

  if (!isAllowed) {
    return (
      <div className="text-center text-red-500">
        You are not allowed to access this route.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background.page }}
    >
      {/* Add Product Drawer */}
      {isAddProductDrawerOpened && (
        <AddProduct
          closeDrawerHandler={closeProductDrawerHandler}
          fetchProductsHandler={fetchProductsHandler}
        />
      )}
      {/* Update Product Drawer */}
      {isUpdateProductDrawerOpened && (
        <UpdateProduct
          closeDrawerHandler={closeUpdateProductDrawerHandler}
          productId={productId}
          fetchProductsHandler={fetchProductsHandler}
        />
      )}
      {/* Product Details Drawer */}
      {isProductDetailsDrawerOpened && (
        <ProductDetails
          closeDrawerHandler={closeProductDetailsDrawerHandler}
          productId={productId}
        />
      )}

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
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Package className="text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: colors.text.primary }}
                >
                  Indirect Products
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Manage your indirect products and services inventory
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={openAddProductDrawerHandler}
                className="inline-flex items-center gap-2 px-3 py-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors"
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
                <MdAdd size="16px" />
                Add Product
              </button>

              {/* Bulk Upload */}
              <button
                onClick={() => setShowBulkUploadMenu(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 whitespace-nowrap rounded-md text-sm font-medium text-white transition-colors"
                style={{
                  backgroundColor: colors.warning[600],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.warning[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.warning[600];
                }}
              >
                <AiFillFileExcel size="16px" />
                Bulk Upload
              </button>

              {/* Export Excel */}
              <button
                onClick={exportToExcelHandler}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3 text-white py-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colors.success[600],
                }}
                onMouseEnter={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.backgroundColor = colors.success[700];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExporting) {
                    e.currentTarget.style.backgroundColor = colors.success[600];
                  }
                }}
              >
                <MdFileDownload size="16px" />
                {isExporting ? "Exporting..." : "Export Excel"}
              </button>

              {/* Refresh */}
              <button
                onClick={fetchProductsHandler}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
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
                <MdOutlineRefresh size="16px" />
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
                Search Products
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
                  placeholder="Search by name, ID, category..."
                  value={searchKey || ""}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </div>

            {/* Products/Services Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Type
              </label>
              <select
                value={productServiceFilter}
                onChange={(e) => setProductServiceFilter(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                style={{
                  backgroundColor: colors.input.background,
                  borderColor: colors.input.border,
                  color: colors.text.primary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.input.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.input.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="">All Types</option>
                <option value="product">Products</option>
                <option value="service">Services</option>
              </select>
            </div>

            {/* Store Filter */}
            <div className="w-full lg:w-48">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Store
              </label>
              <Select
                styles={customSelectStyles}
                options={storeOptions}
                value={storeFilter}
                onChange={(d: any) => setStoreFilter(d)}
                placeholder="Select store..."
                isClearable
              />
            </div>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUploadMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-xl shadow-xl max-w-md w-full p-6"
              style={{ backgroundColor: colors.background.card }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Bulk Upload Indirect Products
                </h3>
                <button
                  onClick={() => setShowBulkUploadMenu(false)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: colors.text.secondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.gray[100];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <RxCross2 size="20px" />
                </button>
              </div>

              <form onSubmit={bulkUploadHandler}>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Choose File (.csv or .xlsx)
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                    style={{
                      backgroundColor: colors.input.background,
                      borderColor: colors.input.border,
                      color: colors.text.primary,
                    }}
                  />
                  <p
                    className="text-xs mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Note: Product ID will be auto-generated. Don't include it in
                    your file.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={bulkUploading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: colors.button.primary,
                      color: colors.text.inverse,
                    }}
                  >
                    {bulkUploading ? "Uploading..." : "Upload"}
                    <AiFillFileExcel size="16px" />
                  </button>

                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    Sample Template
                    <AiFillFileExcel size="16px" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div
          className="rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <ProductTable
            isLoadingProducts={isLoadingProducts}
            products={filteredData}
            openUpdateProductDrawerHandler={openUpdateProductDrawerHandler}
            openProductDetailsDrawerHandler={openProductDetailsDrawerHandler}
            deleteProductHandler={deleteProductHandler}
            bulkDeleteProductsHandler={bulkDeleteProductsHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default IndirectProducts;
