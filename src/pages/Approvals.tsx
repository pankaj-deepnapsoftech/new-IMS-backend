// @ts-nocheck

import { toast } from "react-toastify";
import {
  useDeleteAgentMutation,
  useDeleteBomMutation,
  useDeleteProductMutation,
  useDeleteStoresMutation,
  useUpdateAgentMutation,
  useUpdateBOMMutation,
  useUpdateProductMutation,
  useUpdateStoreMutation,
} from "../redux/api/api";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Button } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import ProductTable from "../components/Table/ProductTable";
import AgentTable from "../components/Table/AgentTable";
import BOMTable from "../components/Table/BOMTable";
import BOMRawMaterialTable from "../components/Table/BOMRawMaterialTable";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { colors } from "../theme/colors";
import StoreTable from "../components/Table/StoreTable";

const Approvals: React.FC = () => {
  const [cookies] = useCookies();
  const [activeSection, setActiveSection] = useState("products");

  const { isSuper, allowedroutes } = useSelector((state: any) => state.auth);
  const isAllowed = isSuper || allowedroutes.includes("Approval");
  //  Products
  const [productSearchKey, setProductSearchKey] = useState<
    string | undefined
  >();
  const [products, setProducts] = useState<any>([]);
  const [filteredProducts, setFilteredProducts] = useState<any>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  //  Stores
  const [storeSearchKey, setStoreSearchKey] = useState<string | undefined>();
  const [stores, setStores] = useState<any>([]);
  const [filteredStores, setFilteredStores] = useState<any>([]);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(false);
  //  Buyer
  const [buyerSearchKey, setBuyerSearchKey] = useState<string | undefined>();
  const [buyers, setBuyers] = useState<any>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<any>([]);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState<boolean>(false);
  //  Supplier
  const [sellerSearchKey, setSellerSearchKey] = useState<string | undefined>();
  const [sellers, setSellers] = useState<any>([]);
  const [filteredSellers, setFilteredSellers] = useState<any>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState<boolean>(false);
  //  BOM
  const [bomSearchKey, setBomSearchKey] = useState<string | undefined>();
  const [boms, setBoms] = useState<any>([]);
  const [filteredBoms, setFilteredBoms] = useState<any>([]);
  const [isLoadingBoms, setIsLoadingBoms] = useState<boolean>(false);
  //  BOM Raw Materials
  const [bomRMSearchKey, setBomRMSearchKey] = useState<string | undefined>();
  const [bomRMs, setBomRMs] = useState<any>([]);
  const [filteredBomRMs, setFilteredBomRMs] = useState<any>([]);
  const [isLoadingBomRMs, setIsLoadingBomRMs] = useState<boolean>(false);

  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteStore] = useDeleteStoresMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [deleteAgent] = useDeleteAgentMutation();
  const [updateAgent] = useUpdateAgentMutation();
  const [deleteBom] = useDeleteBomMutation();
  const [updateBom] = useUpdateBOMMutation();

  // For Unapproved Products
  const fetchUnapprovedProductsHandler = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "product/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setProducts(data.unapproved);
      setFilteredProducts(data.unapproved);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const approveProductHandler = async (id: string) => {
    try {
      const response: any = await updateProduct({
        _id: id,
        approved: true,
      }).unwrap();
      toast.success(response.message);
      fetchUnapprovedProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const deleteProductHandler = async (id: string) => {
    try {
      const response: any = await deleteProduct({ _id: id }).unwrap();
      toast.success(response.message);
      fetchUnapprovedProductsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved Stores
  const fetchUnapprovedStoresHandler = async () => {
    try {
      setIsLoadingStores(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "store/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setStores(data.unapproved);
      setFilteredStores(data.unapproved);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingStores(false);
    }
  };

  const approveStoreHandler = async (id: string) => {
    try {
      const response = await updateStore({ _id: id, approved: true }).unwrap();
      toast.success(response.message);
      fetchUnapprovedStoresHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const deleteStoreHandler = async (id: string) => {
    try {
      const response: any = await deleteStore(id).unwrap();
      toast.success(response.message);
      fetchUnapprovedStoresHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved Buyers And Sellers
  const fetchUnapprovedBuyersHandler = async () => {
    try {
      setIsLoadingBuyers(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "agent/unapproved-buyers",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setBuyers(data.agents);
      setFilteredBuyers(data.agents);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  const fetchUnapprovedSellersHandler = async () => {
    try {
      setIsLoadingBuyers(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "agent/unapproved-suppliers",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setSellers(data.agents);
      setFilteredSellers(data.agents);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  const approveAgentHandler = async (id: string) => {
    try {
      const response = await updateAgent({ _id: id, approved: true }).unwrap();
      toast.success(response.message);
      fetchUnapprovedBuyersHandler();
      fetchUnapprovedSellersHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const deleteAgentHandler = async (id: string) => {
    try {
      const response: any = await deleteAgent(id).unwrap();
      toast.success(response.message);
      fetchUnapprovedBuyersHandler();
      fetchUnapprovedSellersHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved BOMs
  const fetchUnapprovedBomsHandler = async () => {
    try {
      setIsLoadingBoms(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "bom/unapproved",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setBoms(data.boms);
      setFilteredBoms(data.boms);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBoms(false);
    }
  };

  const approveBomHandler = async (id: string) => {
    try {
      const response = await updateBom({ _id: id, approved: true }).unwrap();
      toast.success(response.message);
      fetchUnapprovedBomsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const deleteBomHandler = async (id: string) => {
    try {
      const response: any = await deleteBom(id).unwrap();
      toast.success(response.message);
      fetchUnapprovedBomsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  // For Unapproved BOM Raw Materials
  const fetchUnapprovedBomRMsHandler = async () => {
    try {
      setIsLoadingBomRMs(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "bom/unapproved/raw-materials",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();
      setBomRMs(data.unapproved);
      setFilteredBomRMs(data.unapproved);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    } finally {
      setIsLoadingBomRMs(false);
    }
  };

  const approveBomRMHandler = async (id: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + "bom/approve/raw-materials",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            _id: id,
          }),
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      toast.success(data.message);
      fetchUnapprovedBomRMsHandler();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchUnapprovedProductsHandler();
    fetchUnapprovedStoresHandler();
    fetchUnapprovedBuyersHandler();
    fetchUnapprovedSellersHandler();
    fetchUnapprovedBomsHandler();
    fetchUnapprovedBomRMsHandler();
  }, []);

  // Product Search
  useEffect(() => {
    const searchTxt = productSearchKey?.toLowerCase();
    const results = products.filter(
      (prod: any) =>
        prod.name?.toLowerCase()?.includes(searchTxt) ||
        prod.product_id?.toLowerCase()?.includes(searchTxt) ||
        prod.category?.toLowerCase()?.includes(searchTxt) ||
        prod.price?.toString()?.toLowerCase()?.toString().includes(searchTxt) ||
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
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredStores(results);
  }, [productSearchKey]);

  // Store Search
  useEffect(() => {
    const searchTxt = storeSearchKey?.toLowerCase();
    const results = stores.filter(
      (st: any) =>
        st.name?.toLowerCase()?.includes(searchTxt) ||
        st.gst_number?.toLowerCase()?.includes(searchTxt) ||
        st.address_line1
          ?.toString()
          ?.toLowerCase()
          ?.toString()
          .includes(searchTxt) ||
        st.address_line2?.toLowerCase()?.includes(searchTxt) ||
        st.pincode?.toString().toString().includes(searchTxt) ||
        st?.city?.toString()?.includes(searchTxt) ||
        st?.state?.toString()?.includes(searchTxt) ||
        (st?.createdAt &&
          new Date(st?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (st?.updatedAt &&
          new Date(st?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredStores(results);
  }, [storeSearchKey]);

  // Buyer Search
  useEffect(() => {
    const searchTxt = buyerSearchKey?.toLowerCase();
    const results = buyers.filter(
      (buyer: any) =>
        buyer.name?.toLowerCase()?.includes(searchTxt) ||
        buyer.email?.toLowerCase()?.includes(searchTxt) ||
        buyer.phone?.toLowerCase()?.includes(searchTxt) ||
        buyer?.gst_number?.toLowerCase()?.includes(searchTxt) ||
        buyer.company_name.toLowerCase().includes(searchTxt) ||
        buyer.company_email.toLowerCase().includes(searchTxt) ||
        buyer.company_phone.toLowerCase().includes(searchTxt) ||
        buyer.address_line1.toLowerCase().includes(searchTxt) ||
        buyer?.address_line2?.toLowerCase()?.includes(searchTxt) ||
        buyer?.pincode?.toLowerCase()?.includes(searchTxt) ||
        buyer.city.toLowerCase().includes(searchTxt) ||
        buyer.state.toLowerCase().includes(searchTxt) ||
        (buyer?.createdAt &&
          new Date(buyer?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (buyer?.updatedAt &&
          new Date(buyer?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredBuyers(results);
  }, [buyerSearchKey]);

  // Seller Search
  useEffect(() => {
    const searchTxt = sellerSearchKey?.toLowerCase();
    const results = sellers.filter(
      (seller: any) =>
        seller.name?.toLowerCase()?.includes(searchTxt) ||
        seller.email?.toLowerCase()?.includes(searchTxt) ||
        seller.phone?.toLowerCase()?.includes(searchTxt) ||
        seller?.gst_number?.toLowerCase()?.includes(searchTxt) ||
        seller.company_name.toLowerCase().includes(searchTxt) ||
        seller.company_email.toLowerCase().includes(searchTxt) ||
        seller.company_phone.toLowerCase().includes(searchTxt) ||
        seller.address_line1.toLowerCase().includes(searchTxt) ||
        seller?.address_line2?.toLowerCase()?.includes(searchTxt) ||
        seller?.pincode?.toLowerCase()?.includes(searchTxt) ||
        seller.city.toLowerCase().includes(searchTxt) ||
        seller.state.toLowerCase().includes(searchTxt) ||
        (seller?.createdAt &&
          new Date(seller?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (seller?.updatedAt &&
          new Date(seller?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredSellers(results);
  }, [sellerSearchKey]);

  // BOM Search
  useEffect(() => {
    const searchTxt = bomSearchKey?.toLowerCase();
    const results = boms.filter(
      (bom: any) =>
        bom.bom_name?.toLowerCase()?.includes(searchTxt) ||
        bom.parts_count?.toString()?.toLowerCase()?.includes(searchTxt) ||
        bom.total_cost?.toString()?.toLowerCase()?.includes(searchTxt) ||
        (bom?.approved_by?.first_name + " " + bom?.approved_by?.last_name)
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTxt || "") ||
        (bom?.createdAt &&
          new Date(bom?.createdAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            .reverse()
            .join("")
            ?.includes(searchTxt?.replaceAll("/", "") || "")) ||
        (bom?.updatedAt &&
          new Date(bom?.updatedAt)
            ?.toISOString()
            ?.substring(0, 10)
            ?.split("-")
            ?.reverse()
            ?.join("")
            ?.includes(searchTxt?.replaceAll("/", "") || ""))
    );
    setFilteredBoms(results);
  }, [bomSearchKey]);

  if (!isAllowed) {
    return (
      <div className="text-center text-red-500">
        You are not allowed to access this route.
      </div>
    );
  }
 
  const sections = [
    { id: "products", label: "Products" },
    { id: "stores", label: "Stores" },
    { id: "buyers", label: "Buyers" },
    { id: "sellers", label: "Suppliers" },
    { id: "boms", label: "BOMs" },
    { id: "bomRMs", label: "BOM Raw Materials" },
  ];
  return (
      // <div
      //   className="min-h-screen"
      //   style={{ backgroundColor: colors.background.page }}
      // >
      //   <div className="p-2 lg:p-3">
      //     {/* Main Header */}
      //     <div
      //       className="rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
      //       style={{
      //         backgroundColor: colors.background.card,
      //         borderColor: colors.border.light,
      //       }}
      //     >
      //       <div className="text-center">
      //         <h1
      //           className="text-2xl lg:text-3xl font-bold"
      //           style={{ color: colors.text.primary }}
      //         >
      //           Approvals Management
      //         </h1>
      //         <p
      //           className="text-sm mt-1"
      //           style={{ color: colors.text.secondary }}
      //         >
      //           Review and approve pending products, stores, buyers, sellers, and
      //           BOMs
      //         </p>
      //       </div>
      //     </div>

      //     {/* Products Section */}
          // <div
          //   className="rounded-xl shadow-sm border border-gray-100 mb-6"
          //   style={{
          //     backgroundColor: colors.background.card,
          //     borderColor: colors.border.light,
          //   }}
          // >
          //   <div
          //     className="p-6 border-b"
          //     style={{ borderColor: colors.border.light }}
          //   >
          //     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          //       <div>
          //         <h2
          //           className="text-xl font-semibold"
          //           style={{ color: colors.text.primary }}
          //         >
          //           Products for Approval
          //         </h2>
          //         <p
          //           className="text-sm mt-1"
          //           style={{ color: colors.text.secondary }}
          //         >
          //           Review and approve pending products
          //         </p>
          //       </div>

          //       <div className="flex flex-col sm:flex-row gap-3">
          //         <div className="relative">
          //           <FiSearch
          //             className="absolute left-3 top-1/2 transform -translate-y-1/2"
          //             style={{ color: colors.text.secondary }}
          //           />
          //           <input
          //             className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
          //             style={{
          //               backgroundColor: colors.input.background,
          //               borderColor: colors.input.border,
          //               color: colors.text.primary,
          //             }}
          //             placeholder="Search products..."
          //             value={productSearchKey || ""}
          //             onChange={(e) => setProductSearchKey(e.target.value)}
          //           />
          //         </div>

          //         <button
          //           onClick={fetchUnapprovedProductsHandler}
          //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
          //           style={{
          //             borderColor: colors.border.medium,
          //             color: colors.text.primary,
          //             backgroundColor: colors.background.card,
          //           }}
          //         >
          //           <MdOutlineRefresh size="16px" />
          //           Refresh
          //         </button>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="overflow-hidden">
          //     <ProductTable
          //       isLoadingProducts={isLoadingProducts}
          //       products={filteredProducts}
          //       deleteProductHandler={deleteProductHandler}
          //       approveProductHandler={approveProductHandler}
          //     />
          //   </div>
          // </div>

      //     {/* Stores Section */}
      //     <div
      //       className="rounded-xl shadow-sm border border-gray-100 mb-6"
      //       style={{
      //         backgroundColor: colors.background.card,
      //         borderColor: colors.border.light,
      //       }}
      //     >
      //       <div
      //         className="p-6 border-b"
      //         style={{ borderColor: colors.border.light }}
      //       >
      //         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      //           <div>
      //             <h2
      //               className="text-xl font-semibold"
      //               style={{ color: colors.text.primary }}
      //             >
      //               Stores for Approval
      //             </h2>
      //             <p
      //               className="text-sm mt-1"
      //               style={{ color: colors.text.secondary }}
      //             >
      //               Review and approve pending stores
      //             </p>
      //           </div>

      //           <div className="flex flex-col sm:flex-row gap-3">
      //             <div className="relative">
      //               <FiSearch
      //                 className="absolute left-3 top-1/2 transform -translate-y-1/2"
      //                 style={{ color: colors.text.secondary }}
      //               />
      //               <input
      //                 className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
      //                 style={{
      //                   backgroundColor: colors.input.background,
      //                   borderColor: colors.input.border,
      //                   color: colors.text.primary,
      //                 }}
      //                 placeholder="Search stores..."
      //                 value={storeSearchKey || ""}
      //                 onChange={(e) => setStoreSearchKey(e.target.value)}
      //               />
      //             </div>

      //             <button
      //               onClick={fetchUnapprovedStoresHandler}
      //               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
      //               style={{
      //                 borderColor: colors.border.medium,
      //                 color: colors.text.primary,
      //                 backgroundColor: colors.background.card,
      //               }}
      //             >
      //               <MdOutlineRefresh size="16px" />
      //               Refresh
      //             </button>
      //           </div>
      //         </div>
      //       </div>

      //       <div className="overflow-hidden">
      //         <StoreTable
      //           isLoadingStores={isLoadingStores}
      //           stores={filteredStores}
      //           deleteStoreHandler={deleteStoreHandler}
      //         />
      //       </div>
      //     </div>

      //     {/* Buyers Section */}
          // <div
          //   className="rounded-xl shadow-sm border border-gray-100 mb-6"
          //   style={{
          //     backgroundColor: colors.background.card,
          //     borderColor: colors.border.light,
          //   }}
          // >
          //   <div
          //     className="p-6 border-b"
          //     style={{ borderColor: colors.border.light }}
          //   >
          //     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          //       <div>
          //         <h2
          //           className="text-xl font-semibold"
          //           style={{ color: colors.text.primary }}
          //         >
          //           Buyers for Approval
          //         </h2>
          //         <p
          //           className="text-sm mt-1"
          //           style={{ color: colors.text.secondary }}
          //         >
          //           Review and approve pending buyers
          //         </p>
          //       </div>

          //       <div className="flex flex-col sm:flex-row gap-3">
          //         <div className="relative">
          //           <FiSearch
          //             className="absolute left-3 top-1/2 transform -translate-y-1/2"
          //             style={{ color: colors.text.secondary }}
          //           />
          //           <input
          //             className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
          //             style={{
          //               backgroundColor: colors.input.background,
          //               borderColor: colors.input.border,
          //               color: colors.text.primary,
          //             }}
          //             placeholder="Search buyers..."
          //             value={buyerSearchKey || ""}
          //             onChange={(e) => setBuyerSearchKey(e.target.value)}
          //           />
          //         </div>

          //         <button
          //           onClick={fetchUnapprovedBuyersHandler}
          //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
          //           style={{
          //             borderColor: colors.border.medium,
          //             color: colors.text.primary,
          //             backgroundColor: colors.background.card,
          //           }}
          //         >
          //           <MdOutlineRefresh size="16px" />
          //           Refresh
          //         </button>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="overflow-hidden">
          //     <AgentTable
          //       isLoadingAgents={isLoadingBuyers}
          //       agents={filteredBuyers}
          //       deleteAgentHandler={deleteAgentHandler}
          //       approveAgentHandler={approveAgentHandler}
          //     />
          //   </div>
          // </div>

      //     {/* Sellers Section */}
          // <div
          //   className="rounded-xl shadow-sm border border-gray-100 mb-6"
          //   style={{
          //     backgroundColor: colors.background.card,
          //     borderColor: colors.border.light,
          //   }}
          // >
          //   <div
          //     className="p-6 border-b"
          //     style={{ borderColor: colors.border.light }}
          //   >
          //     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          //       <div>
          //         <h2
          //           className="text-xl font-semibold"
          //           style={{ color: colors.text.primary }}
          //         >
          //           Suppliers for Approval
          //         </h2>
          //         <p
          //           className="text-sm mt-1"
          //           style={{ color: colors.text.secondary }}
          //         >
          //           Review and approve pending suppliers
          //         </p>
          //       </div>

          //       <div className="flex flex-col sm:flex-row gap-3">
          //         <div className="relative">
          //           <FiSearch
          //             className="absolute left-3 top-1/2 transform -translate-y-1/2"
          //             style={{ color: colors.text.secondary }}
          //           />
          //           <input
          //             className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
          //             style={{
          //               backgroundColor: colors.input.background,
          //               borderColor: colors.input.border,
          //               color: colors.text.primary,
          //             }}
          //             placeholder="Search suppliers..."
          //             value={sellerSearchKey || ""}
          //             onChange={(e) => setSellerSearchKey(e.target.value)}
          //           />
          //         </div>

          //         <button
          //           onClick={fetchUnapprovedSellersHandler}
          //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
          //           style={{
          //             borderColor: colors.border.medium,
          //             color: colors.text.primary,
          //             backgroundColor: colors.background.card,
          //           }}
          //         >
          //           <MdOutlineRefresh size="16px" />
          //           Refresh
          //         </button>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="overflow-hidden">
          //     <AgentTable
          //       isLoadingAgents={isLoadingSellers}
          //       agents={filteredSellers}
          //       deleteAgentHandler={deleteAgentHandler}
          //       approveAgentHandler={approveAgentHandler}
          //     />
          //   </div>
          // </div>

      //     {/* BOMs Section */}
          // <div
          //   className="rounded-xl shadow-sm border border-gray-100 mb-6"
          //   style={{
          //     backgroundColor: colors.background.card,
          //     borderColor: colors.border.light,
          //   }}
          // >
          //   <div
          //     className="p-6 border-b"
          //     style={{ borderColor: colors.border.light }}
          //   >
          //     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          //       <div>
          //         <h2
          //           className="text-xl font-semibold"
          //           style={{ color: colors.text.primary }}
          //         >
          //           BOMs for Approval
          //         </h2>
          //         <p
          //           className="text-sm mt-1"
          //           style={{ color: colors.text.secondary }}
          //         >
          //           Review and approve pending Bill of Materials
          //         </p>
          //       </div>

          //       <div className="flex flex-col sm:flex-row gap-3">
          //         <div className="relative">
          //           <FiSearch
          //             className="absolute left-3 top-1/2 transform -translate-y-1/2"
          //             style={{ color: colors.text.secondary }}
          //           />
          //           <input
          //             className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
          //             style={{
          //               backgroundColor: colors.input.background,
          //               borderColor: colors.input.border,
          //               color: colors.text.primary,
          //             }}
          //             placeholder="Search BOMs..."
          //             value={bomSearchKey || ""}
          //             onChange={(e) => setBomSearchKey(e.target.value)}
          //           />
          //         </div>

          //         <button
          //           onClick={fetchUnapprovedBomsHandler}
          //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
          //           style={{
          //             borderColor: colors.border.medium,
          //             color: colors.text.primary,
          //             backgroundColor: colors.background.card,
          //           }}
          //         >
          //           <MdOutlineRefresh size="16px" />
          //           Refresh
          //         </button>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="overflow-hidden">
          //     <BOMTable
          //       isLoadingBoms={isLoadingBoms}
          //       boms={filteredBoms}
          //       deleteBomHandler={deleteBomHandler}
          //       approveBomHandler={approveBomHandler}
          //     />
          //   </div>
          // </div>

      //     {/* BOM Raw Materials Section */}
          // <div
          //   className="rounded-xl shadow-sm border border-gray-100 mb-6"
          //   style={{
          //     backgroundColor: colors.background.card,
          //     borderColor: colors.border.light,
          //   }}
          // >
          //   <div
          //     className="p-6 border-b"
          //     style={{ borderColor: colors.border.light }}
          //   >
          //     <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          //       <div>
          //         <h2
          //           className="text-xl font-semibold"
          //           style={{ color: colors.text.primary }}
          //         >
          //           BOM Raw Materials for Approval
          //         </h2>
          //         <p
          //           className="text-sm mt-1"
          //           style={{ color: colors.text.secondary }}
          //         >
          //           Review and approve pending BOM raw materials
          //         </p>
          //       </div>

          //       <div className="flex flex-col sm:flex-row gap-3">
          //         <div className="relative">
          //           <FiSearch
          //             className="absolute left-3 top-1/2 transform -translate-y-1/2"
          //             style={{ color: colors.text.secondary }}
          //           />
          //           <input
          //             className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
          //             style={{
          //               backgroundColor: colors.input.background,
          //               borderColor: colors.input.border,
          //               color: colors.text.primary,
          //             }}
          //             placeholder="Search raw materials..."
          //             value={bomRMSearchKey || ""}
          //             onChange={(e) => setBomRMSearchKey(e.target.value)}
          //           />
          //         </div>

          //         <button
          //           onClick={fetchUnapprovedBomRMsHandler}
          //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
          //           style={{
          //             borderColor: colors.border.medium,
          //             color: colors.text.primary,
          //             backgroundColor: colors.background.card,
          //           }}
          //         >
          //           <MdOutlineRefresh size="16px" />
          //           Refresh
          //         </button>
          //       </div>
          //     </div>
          //   </div>

          //   <div className="overflow-hidden">
          //     <BOMRawMaterialTable
          //       isLoadingProducts={isLoadingBomRMs}
          //       products={filteredBomRMs}
          //       approveProductHandler={approveBomRMHandler}
          //     />
          //   </div>
          // </div>
      //   </div>
      // </div>
    <div className="min-h-screen" style={{ backgroundColor: colors.background.page }}>
      <div className="p-2 lg:p-3">
      
        <div
          className="rounded-xl shadow-sm border p-6 mb-6"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          }}
        >
          <div className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: colors.text.primary }}>
              Approvals Management
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
              Review and approve pending products, stores, buyers, sellers, and BOMs
            </p>
          </div>
        </div>

       
        <div className="flex flex-wrap gap-3 mb-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium border transition-colors ${activeSection === section.id ? "bg-blue-500 text-white" : ""
                }`}
              style={{
                borderColor: colors.border.medium,
                backgroundColor: activeSection === section.id ? colors.button.primary : colors.background.card,
                color: activeSection === section.id ? "#fff" : colors.text.primary,
              }}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Conditionally Render Sections */}
        {activeSection === "products" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Products for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending products
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search products..."
                      value={productSearchKey || ""}
                      onChange={(e) => setProductSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedProductsHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <ProductTable
                isLoadingProducts={isLoadingProducts}
                products={filteredProducts}
                deleteProductHandler={deleteProductHandler}
                approveProductHandler={approveProductHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "stores" && (
          <div
                className="rounded-xl shadow-sm border border-gray-100 mb-6"
                style={{
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.light,
                }}
              >
                <div
                  className="p-6 border-b"
                  style={{ borderColor: colors.border.light }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h2
                        className="text-xl font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        Stores for Approval
                      </h2>
                      <p
                        className="text-sm mt-1"
                        style={{ color: colors.text.secondary }}
                      >
                        Review and approve pending stores
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <FiSearch
                          className="absolute left-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: colors.text.secondary }}
                        />
                        <input
                          className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                          style={{
                            backgroundColor: colors.input.background,
                            borderColor: colors.input.border,
                            color: colors.text.primary,
                          }}
                          placeholder="Search stores..."
                          value={storeSearchKey || ""}
                          onChange={(e) => setStoreSearchKey(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={fetchUnapprovedStoresHandler}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                        style={{
                          borderColor: colors.border.medium,
                          color: colors.text.primary,
                          backgroundColor: colors.background.card,
                        }}
                      >
                        <MdOutlineRefresh size="16px" />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <StoreTable
                    isLoadingStores={isLoadingStores}
                    stores={filteredStores}
                    deleteStoreHandler={deleteStoreHandler}
                  />
                </div>
              </div>
        )}

        {activeSection === "buyers" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Buyers for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending buyers
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search buyers..."
                      value={buyerSearchKey || ""}
                      onChange={(e) => setBuyerSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedBuyersHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <AgentTable
                isLoadingAgents={isLoadingBuyers}
                agents={filteredBuyers}
                deleteAgentHandler={deleteAgentHandler}
                approveAgentHandler={approveAgentHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "sellers" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    Suppliers for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending suppliers
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search suppliers..."
                      value={sellerSearchKey || ""}
                      onChange={(e) => setSellerSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedSellersHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <AgentTable
                isLoadingAgents={isLoadingSellers}
                agents={filteredSellers}
                deleteAgentHandler={deleteAgentHandler}
                approveAgentHandler={approveAgentHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "boms" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    BOMs for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending Bill of Materials
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search BOMs..."
                      value={bomSearchKey || ""}
                      onChange={(e) => setBomSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedBomsHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <BOMTable
                isLoadingBoms={isLoadingBoms}
                boms={filteredBoms}
                deleteBomHandler={deleteBomHandler}
                approveBomHandler={approveBomHandler}
              />
            </div>
          </div>
        )}

        {activeSection === "bomRMs" && (
          <div
            className="rounded-xl shadow-sm border border-gray-100 mb-6"
            style={{
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            }}
          >
            <div
              className="p-6 border-b"
              style={{ borderColor: colors.border.light }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    BOM Raw Materials for Approval
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Review and approve pending BOM raw materials
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FiSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-3 transition-colors"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      placeholder="Search raw materials..."
                      value={bomRMSearchKey || ""}
                      onChange={(e) => setBomRMSearchKey(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={fetchUnapprovedBomRMsHandler}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
                    style={{
                      borderColor: colors.border.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.background.card,
                    }}
                  >
                    <MdOutlineRefresh size="16px" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <BOMRawMaterialTable
                isLoadingProducts={isLoadingBomRMs}
                products={filteredBomRMs}
                approveProductHandler={approveBomRMHandler}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
