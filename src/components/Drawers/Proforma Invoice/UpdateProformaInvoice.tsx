import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useUpdateProformaInvoiceMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../../ui/Loading";
import moment from "moment";
import AddItems from "../../Dynamic Add Components/AddItems";
import { colors } from "../../../theme/colors";

interface UpdateProformaInvoiceProps {
  closeDrawerHandler: () => void;
  fetchProformaInvoicesHandler: () => void;
  id: string | undefined;
}

const UpdateProformaInvoice: React.FC<UpdateProformaInvoiceProps> = ({
  closeDrawerHandler,
  fetchProformaInvoicesHandler,
  id,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<
    { value: string; label: string } | undefined
  >();
  const [supplier, setSupplier] = useState<
    { value: string; label: string } | undefined
  >();
  const [proformaInvoiceNo, setProformaInvoiceNo] = useState<
    string | undefined
  >();
  const [documentDate, setDocumentDate] = useState<string | undefined>();
  const [salesOrderDate, setSalesOrderDate] = useState<string | undefined>();
  const [note, setNote] = useState<string | undefined>();
  const [subtotal, setSubtotal] = useState<number | undefined>(0);
  const [total, setTotal] = useState<number | undefined>();
  const [items, setItems] = useState<any[] | []>([]);
  const [allItems, setAllItems] = useState<any[] | []>([]);
  const [itemOptions, setItemOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [buyers, setBuyers] = useState<any[] | []>([]);
  const [buyerOptions, setBuyerOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  // Add these near the other state declarations
  const [isLoadingBuyers, setIsLoadingBuyers] = useState<boolean>(true);
  const [buyerFetchError, setBuyerFetchError] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<any[] | []>([]);
  const [supplierOptions, setSupplierOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [category, setCategory] = useState<
    { value: string; label: string } | undefined
  >();
  const categoryOptions = [
    { value: "sale", label: "Sales" },
    { value: "purchase", label: "Purchase" },
  ];
  const [store, setStore] = useState<
    { value: string; label: string } | undefined
  >();
  const [storeOptions, setStoreOptions] = useState<
    { value: string; label: string }[] | []
  >([]);
  const [tax, setTax] = useState<
    { value: number; label: string } | undefined
  >();
  const taxOptions = [
    { value: 0.18, label: "GST 18%" },
    { value: 0, label: "No Tax 0%" },
  ];
  const [inputs, setInputs] = useState<
    {
      item: { value: string; label: string };
      quantity: number;
      price: number;
    }[]
  >([{ item: { value: "", label: "" }, quantity: 0, price: 0 }]);

  const [updateProformaInvoice] = useUpdateProformaInvoiceMutation();

  const updateProformaInvoiceHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      _id: id,
      buyer: buyer?.value,
      proforma_invoice_no: proformaInvoiceNo,
      document_date: documentDate,
      sales_order_date: salesOrderDate,
      note: note,
      tax: { tax_amount: tax?.value, tax_name: tax?.label },
      subtotal: subtotal,
      total: total,
      store: store?.value,
      items: inputs.map((item: any) => ({
        item: item.item.value,
        quantity: item.quantity,
        amount: item.price,
      })),
    };

    try {
      setIsUpdating(true);
      const response = await updateProformaInvoice(data).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeDrawerHandler();
      fetchProformaInvoicesHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchProformaInvoiceDetailsHandler = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `proforma-invoice/${id}`,
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

      if (data.proforma_invoice.buyer?._id) {
        const b = data.proforma_invoice.buyer;
        setBuyer({
          value: b._id,
          label: b.company_name || b.consignee_name?.[0] || b.name || "Unnamed Buyer",
        });
      

      } else if (data.proforma_invoice.supplier?._id) {
        setSupplier({
          value: data.proforma_invoice.supplier._id,
          label: data.proforma_invoice.supplier.name,
        });
      }

      setProformaInvoiceNo(data.proforma_invoice.proforma_invoice_no);
      setDocumentDate(moment(data.proforma_invoice.document_date).format("YYYY-MM-DD"));
      setSalesOrderDate(moment(data.proforma_invoice.sales_order_date).format("YYYY-MM-DD"));

      setSubtotal(data.proforma_invoice.subtotal);
      setTotal(data.proforma_invoice.total);
      setNote(data.proforma_invoice?.note || "");
      setStore({
        value: data.proforma_invoice.store._id,
        label: data.proforma_invoice.store.name,
      });
      setTax({
        value: data.proforma_invoice.tax?.tax_amount,
        label: data.proforma_invoice.tax?.tax_name,
      });
      setCategory({
        value: data.proforma_invoice.category,
        label:
          data.proforma_invoice.category.substr(0, 1).toUpperCase() +
          data.proforma_invoice.category.substr(1),
      });
      setInputs(
        data.proforma_invoice.items.map((item: any) => ({
          item: { value: item.item._id, label: item.item.name },
          price: item.amount,
          quantity: item.quantity,
        }))
      );
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuyersHandler = async () => {
    try {
      setIsLoadingBuyers(true);
      setBuyerFetchError(null);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}parties/get?page=1&limit=1000&selectedRole=Buyer`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch buyers");
      }

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("No buyers found or invalid response format");
      }

      const formattedBuyers = data.data
        .filter((b: any) => b.parties_type === "Buyer")
        .map((b: any) => ({
          value: b._id,
          label: b.company_name || b.consignee_name?.[0] || "Unnamed Buyer",
          ...b,
        }));

      setBuyerOptions(formattedBuyers);
      setBuyers(formattedBuyers);

      if (formattedBuyers.length === 1) {
        setBuyer(formattedBuyers[0]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch buyers";
      console.error("Buyers Fetch Error:", error);
      setBuyerFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingBuyers(false);
    }
  };
console.log(buyer)

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

      const suppliers = data.agents.map((supplier: any) => ({
        value: supplier._id,
        label: supplier.name,
      }));
      setSupplierOptions(suppliers);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  const fetchItemsHandler = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}product/all`,
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

      const finishedGoods = results.products
        .filter((product: any) => product.category?.toLowerCase() === "finished goods")
        .map((product: any) => ({
          value: product._id,
          label: product.name,
          ...product,
        }));

      setItemOptions(finishedGoods);
      setAllItems(finishedGoods);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
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
      const stores = data.stores.map((store: any) => ({
        value: store._id,
        label: store.name,
      }));
      setStoreOptions(stores);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (tax && subtotal) {
      setTotal(subtotal + tax?.value * subtotal);
    }
  }, [tax, subtotal]);

  useEffect(() => {
    const price = inputs.reduce((acc: number, curr: any) => {
      return acc + (curr?.price * curr?.quantity || 0);
    }, 0);
    setSubtotal(price);
  }, [inputs]);

  useEffect(() => {
    fetchBuyersHandler();
    fetchItemsHandler();
    fetchStoresHandler();
    fetchSuppliersHandler();
  }, []);


  useEffect(() => {
    fetchProformaInvoiceDetailsHandler(id || "");
  }, [id]);

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
          Update Proforma Invoice
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
        {isLoading && <Loading />}
        {!isLoading && (
          <form onSubmit={updateProformaInvoiceHandler}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Category
                </FormLabel>
                <Select
                  value={category}
                  options={categoryOptions}
                  required={true}
                  onChange={(e: any) => setCategory(e)}
                  styles={{
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
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: "#9ca3af",
                    }),
                    singleValue: (provided: any) => ({
                      ...provided,
                      color: "#374151",
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      zIndex: 9999,
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                    }),
                  }}
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Buyer
                </FormLabel>
                <Select
                  value={buyer}
                  options={buyerOptions}
                  required={true}
                  onChange={(selectedOption: any) => setBuyer(selectedOption)}
                  isLoading={isLoadingBuyers}
                  placeholder={isLoadingBuyers ? "Loading buyers..." : buyerFetchError ? "No buyers available" : "Select a buyer"}
                styles={{
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
                  placeholder: (provided: any) => ({
                    ...provided,
                    color: "#9ca3af",
                  }),
                  singleValue: (provided: any) => ({
                    ...provided,
                    color: "#374151",
                  }),
                  menu: (provided: any) => ({
                    ...provided,
                    zIndex: 9999,
                    backgroundColor: "white",
                    border: "1px solid #d1d5db",
                  }),
                }}
                           />
                {buyerFetchError && (
                  <p className="text-sm text-red-500 mt-1">{buyerFetchError}</p>
                )}
              </FormControl>
              {/* {category && category.value === "purchase" && (
                <FormControl className="mt-3 mb-5" isRequired>
                  <FormLabel fontWeight="bold" color="gray.700">
                    Supplier
                  </FormLabel>
                  <Select
                    value={supplier}
                    options={supplierOptions}
                    required={true}
                    onChange={(e: any) => setSupplier(e)}
                    styles={{
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
                      placeholder: (provided: any) => ({
                        ...provided,
                        color: "#9ca3af",
                      }),
                      singleValue: (provided: any) => ({
                        ...provided,
                        color: "#374151",
                      }),
                      menu: (provided: any) => ({
                        ...provided,
                        zIndex: 9999,
                        backgroundColor: "white",
                        border: "1px solid #d1d5db",
                      }),
                    }}
                  />
                </FormControl>
              )} */}
              {/* <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Proforma Invoice No.
                </FormLabel>
                <Input
                  className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={proformaInvoiceNo}
                  onChange={(e) => setProformaInvoiceNo(e.target.value)}
                  type="text"
                  placeholder="Proforma Invoice No."
                  bg="white"
                  color="gray.700"
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl> */}
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Document Date
                </FormLabel>
                <Input
                  value={documentDate}
                  className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setDocumentDate(e.target.value)}
                  type="date"
                  placeholder="Document Date"
                  bg="white"
                  color="gray.700"
                />
              </FormControl>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Sales Order Date
                </FormLabel>
                <Input
                  value={salesOrderDate}
                  className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setSalesOrderDate(e.target.value)}
                  type="date"
                  placeholder="Sales Order Date"
                  bg="white"
                  color="gray.700"
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Store
                </FormLabel>
                <Select
                  value={store}
                  options={storeOptions}
                  required={true}
                  onChange={(e: any) => setStore(e)}
                  styles={{
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
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: "#9ca3af",
                    }),
                    singleValue: (provided: any) => ({
                      ...provided,
                      color: "#374151",
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      zIndex: 9999,
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                    }),
                  }}
                />
              </FormControl>
            </div>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Note
              </FormLabel>
              <textarea
                className="border border-gray-300 w-full px-3 py-2 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your notes..."
                rows={3}
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Items
              </FormLabel>
              <AddItems inputs={inputs} setInputs={setInputs} />
            </FormControl>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Subtotal
                </FormLabel>
                <Input
                  value={subtotal}
                  isDisabled={true}
                  className="border border-gray-300"
                  type="number"
                  placeholder="Subtotal"
                  bg="gray.50"
                  color="gray.700"
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Tax
                </FormLabel>
                <Select
                  required={true}
                  value={tax}
                  options={taxOptions}
                  onChange={(e: any) => setTax(e)}
                  styles={{
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
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: "#9ca3af",
                    }),
                    singleValue: (provided: any) => ({
                      ...provided,
                      color: "#374151",
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      zIndex: 9999,
                      backgroundColor: "white",
                      border: "1px solid #d1d5db",
                    }),
                  }}
                />
              </FormControl>
              <FormControl className="mt-3 mb-5" isRequired>
                <FormLabel fontWeight="bold" color="gray.700">
                  Total
                </FormLabel>
                <Input
                  value={total}
                  isDisabled={true}
                  className="border border-gray-300"
                  bg="gray.50"
                  color="gray.700"
                />
              </FormControl>
            </div>
            <Button
              isLoading={isUpdating}
              type="submit"
              className="mt-1 w-full"
              colorScheme="blue"
              size="lg"
              _hover={{ bg: "blue.600" }}
            >
              Update Proforma Invoice
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateProformaInvoice;
