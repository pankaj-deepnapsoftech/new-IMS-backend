import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useCreateProformaInvoiceMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import AddItems from "../../Dynamic Add Components/AddItems";
import { colors } from "../../../theme/colors";

interface AddProformaInvoiceProps {
  closeDrawerHandler: () => void;
  fetchProformaInvoicesHandler: () => void;
}

const AddProformaInvoice: React.FC<AddProformaInvoiceProps> = ({
  closeDrawerHandler,
  fetchProformaInvoicesHandler,
}) => {
  const [cookies] = useCookies();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [buyer, setBuyer] = useState<{ value: string; label: string } | undefined>();
  const [proformaInvoiceNo, setProformaInvoiceNo] = useState<string | undefined>();
  const [documentDate, setDocumentDate] = useState<string | undefined>();
  const [salesOrderDate, setSalesOrderDate] = useState<string | undefined>();
  const [note, setNote] = useState<string | undefined>();
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number | undefined>();
  const [items, setItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [itemOptions, setItemOptions] = useState<{ value: string; label: string }[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [buyerOptions, setBuyerOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState<boolean>(true);
  const [buyerFetchError, setBuyerFetchError] = useState<string | null>(null);
  const [store, setStore] = useState<{ value: string; label: string } | undefined>();
  const [storeOptions, setStoreOptions] = useState<{ value: string; label: string }[]>([]);
  const [tax, setTax] = useState<{ value: number; label: string } | undefined>();
  
  const taxOptions = [
    { value: 0.18, label: "GST 18%" },
    { value: 0, label: "No Tax 0%" },
  ];
  
  const category = { value: "sale", label: "Sales" };
  const [paymentMode, setPaymentMode] = useState<{ value: string; label: string } | undefined>();

  const paymentModeOptions = [
    { value: "cash", label: "Cash" },
    { value: "neft", label: "NEFT/RTGS" },
    { value: "upi", label: "UPI" },
    { value: "cheque", label: "Cheque" }, { value: "credit", label: "Credit Card" }, { value: "debit", label: "Debit Card" },
    { value: "other", label: "Other" },
  ];

  const [inputs, setInputs] = useState<
    {
      item: { value: string; label: string };
      quantity: number;
      price: number;
    }[]
  >([{ item: { value: "", label: "" }, quantity: 0, price: 0 }]);

  const [addProformaInvoice] = useCreateProformaInvoiceMutation();

  // Fetch the next available proforma invoice number
  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}proforma-invoice/next-invoice-number`,
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
      setProformaInvoiceNo(data.proforma_invoice_no);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch invoice number");
    }
  };

  // Fetch buyers from the parties endpoint
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
       console.log(data)
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch buyers");
      }
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("No buyers found or invalid response format");
      }

      // Format buyer options for the select component
      const formattedBuyers = data.data
        .filter((buyer: any) => buyer.parties_type === "Buyer") // Only include buyers
        .map((buyer: any) => ({
          value: buyer._id,
          label: buyer.company_name || buyer.consignee_name?.[0] || "Unnamed Buyer",
          ...buyer
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

  // Fetch all items from the products endpoint
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
          ...product
        }));

      setItemOptions(finishedGoods);
      setAllItems(finishedGoods); // use only filtered products

    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch items");
    }
  };


  // Fetch all stores
  const fetchStoresHandler = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}store/all`,
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
        ...store // Include all store data
      }));
      setStoreOptions(stores);
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch stores");
    }
  };

  // Handle form submission
  const addProformaInvoiceHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyer?.value) {
      toast.error("Please select a buyer");
      return;
    }
    if (!paymentMode?.value) {
      toast.error("Please select a payment mode");
      return;
    }

    if (!documentDate) {
      toast.error("Please select a document date");
      return;
    }

    if (inputs.some(item => !item.item.value || item.quantity <= 0)) {
      toast.error("Please add at least one valid item");
      return;
    }

    const data = {
      document_date: documentDate,
      sales_order_date: salesOrderDate,
      note: note,
      tax: { 
        tax_amount: tax?.value || 0, 
        tax_name: tax?.label || "No Tax" 
      },
      subtotal: subtotal || 0,
      total: total || 0,
      store: store?.value,
      items: inputs.map((item: any) => ({
        item: item.item.value,
        quantity: item.quantity,
        amount: item.price,
      })),
      category: category.value,
      buyer: buyer.value,
      proforma_invoice_no: proformaInvoiceNo,
      payment_mode: paymentMode.value,
    };

    try {
      setIsAdding(true);
      const response = await addProformaInvoice(data).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeDrawerHandler();
      fetchProformaInvoicesHandler();
      console.log(response);
      
    } catch (error: any) {
      toast.error(error?.message || "Failed to create proforma invoice");
    } finally {
      setIsAdding(false);
    }
  };

  // Calculate total when subtotal or tax changes
  useEffect(() => {
    if (subtotal !== undefined && tax?.value !== undefined) {
      setTotal(subtotal + (subtotal * tax.value));
    } else {
      setTotal(subtotal);
    }
  }, [subtotal, tax]);

  // Calculate subtotal when items change
  useEffect(() => {
    const calculatedSubtotal = inputs.reduce((acc, curr) => {
      return acc + (curr?.price * curr?.quantity || 0);
    }, 0);
    setSubtotal(calculatedSubtotal);
  }, [inputs]);

  // Fetch all required data on component mount
  useEffect(() => {
    fetchBuyersHandler();
    fetchItemsHandler();
    fetchStoresHandler();
    fetchNextInvoiceNumber();
  }, []);

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[100vw] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
      style={{
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
          Add New Proforma Invoice
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
        <form onSubmit={addProformaInvoiceHandler}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Category Field */}
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Category
              </FormLabel>
              <Input
                value={category.label}
                isReadOnly={true}
                className="border border-gray-300"
                bg="gray.50"
                color="gray.900"
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            {/* Proforma Invoice Number */}
      

            {/* Buyer Selection */}
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

            {/* Document Date */}
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

            {/* Sales Order Date */}
            <FormControl className="mt-3 mb-5">
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

            {/* Store Selection */}
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Store
              </FormLabel>
              <Select
                value={store}
                options={storeOptions}
                required={true}
                onChange={(selectedOption: any) => setStore(selectedOption)}
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

            {/* Note Field */}
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="gray.700">
                Note
              </FormLabel>
              <input
                className="border border-gray-300 w-full px-3 py-2 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your notes..."
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="gray.700">
                Payment Mode
              </FormLabel>
              <Select
                value={paymentMode}
                options={paymentModeOptions}
                onChange={(selectedOption: any) => setPaymentMode(selectedOption)}
                placeholder="Select Payment Mode"
                required={true}
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

          

          {/* Items Section */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Items
            </FormLabel>
            <AddItems 
              inputs={inputs} 
              setInputs={setInputs} 
        
            />
          </FormControl>
          

          {/* Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                color="gray.900"
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
                onChange={(selectedOption: any) => setTax(selectedOption)}
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
                className="border border-gray-300"
                value={total}
                isDisabled={true}
                bg="gray.50"
                color="gray.900"
              />
            </FormControl>
          </div>

          {/* Submit Button */}
          <Button
            isLoading={isAdding}
            type="submit"
            className="mt-1 w-full"
            colorScheme="blue"
            size="lg"
            _hover={{ bg: "blue.600" }}
          >
            Create Proforma Invoice
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProformaInvoice;