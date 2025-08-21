// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Text,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  Badge,
  IconButton,
  useColorModeValue,
  Flex,
  Heading,
  Checkbox,
} from "@chakra-ui/react";
import { BiX, BiPackage, BiEdit, BiCalendar, BiUser } from "react-icons/bi";
import { Users, Mail, MapPin, FileSpreadsheet } from "lucide-react";
import { colors } from "../../../theme/colors";
import axios from "axios";

interface AddPurchaseOrderProps {
  isOpen: boolean;
  closeDrawerHandler: () => void;
  edittable?: any;
  fetchPurchaseOrderData?: () => void;
}

interface SupplierOption {
  id: string;
  supplierName: string;
  companyName: string;
  supplierType?: string;
  supplierEmail?: string;
  supplierShippedTo?: string;
  supplierBillTo?: string;
  supplierShippedGSTIN?: string;
  supplierBillGSTIN?: string;
}

interface SupplierApiResponse {
  success: boolean;
  message?: string;
  suppliers: SupplierOption[];
}

interface RawMaterial {
  _id: string;
  name: string;
  product_id?: string;
}

interface Item {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId?: string; // Add product_id to track the product
}

interface PurchaseOrderFormValues {
  poOrder: string;
  date: string;
  supplierIdentifier: string;
  supplierName: string;
  supplierEmail: string;
  supplierShippedTo: string;
  supplierBillTo: string;
  supplierShippedGSTIN: string;
  supplierBillGSTIN: string;
  supplierType: string; // Individual or Company
  GSTApply: string;
  modeOfPayment: string;
  billingAddress: string;
  paymentTerms: string;
  additionalRemarks: string;
  additionalImportant: string;
  items: Item[];
  isSameAddress: boolean;
}

const AddPurchaseOrder: React.FC<AddPurchaseOrderProps> = ({
  isOpen,
  closeDrawerHandler,
  edittable,
  fetchPurchaseOrderData,
}) => {
  const [cookies] = useCookies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
  const [nextPONumber, setNextPONumber] = useState("");
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headingColor = useColorModeValue("gray.700", "gray.200");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const hasError = (fieldName: keyof PurchaseOrderFormValues): boolean => {
    return !!(formik.touched[fieldName] && formik.errors[fieldName]);
  };

  const getErrorMessage = (
    fieldName: keyof PurchaseOrderFormValues
  ): string => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? String(formik.errors[fieldName])
      : "";
  };

  const validationSchema = Yup.object({
    poOrder: Yup.string().required("PO Order is required"),
    date: Yup.string().required("Date is required"),
    supplierIdentifier: Yup.string().required(
      "Supplier name or company name is required"
    ),
    supplierName: Yup.string().required("Supplier name is required"),
    supplierEmail: Yup.string().email("Invalid email"),
    supplierShippedTo: Yup.string().required("Supplier shipped to is required"),
    supplierBillTo: Yup.string().required("Supplier bill to is required"),
    supplierType: Yup.string().required("Supplier type is required"),
    supplierShippedGSTIN: Yup.string().when("supplierType", {
      is: (val) => val === "Company",
      then: (schema) =>
        schema.test(
          "gstin-format",
          "Shipped GSTIN must be exactly 15 characters, only uppercase letters and numbers",
          function (value) {
            if (!value || value.trim() === "") return true; // Allow empty
            return /^[A-Z0-9]{15}$/.test(value);
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    supplierBillGSTIN: Yup.string().when("supplierType", {
      is: (val) => val === "Company",
      then: (schema) =>
        schema.test(
          "gstin-format",
          "Bill GSTIN must be exactly 15 characters, only uppercase letters and numbers",
          function (value) {
            if (!value || value.trim() === "") return true; // Allow empty
            return /^[A-Z0-9]{15}$/.test(value);
          }
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
    GSTApply: Yup.string().required("GST selection is required"),
    modeOfPayment: Yup.string().required("Mode of payment is required"),
    billingAddress: Yup.string(),
    paymentTerms: Yup.string(),
    items: Yup.array()
      .of(
        Yup.object({
          itemName: Yup.string().required("Item name is required"),
          quantity: Yup.number()
            .required("Quantity is required")
            .min(1, "Quantity must be at least 1")
            .integer("Quantity must be an integer"),
          unitPrice: Yup.number().min(0, "Unit price must be positive"),
          totalPrice: Yup.number().min(0, "Total price must be positive"),
        })
      )
      .min(1, "At least one item is required"),
    additionalRemarks: Yup.string(),
    additionalImportant: Yup.string(),
    isSameAddress: Yup.boolean(),
  });

  const formik = useFormik<PurchaseOrderFormValues>({
    initialValues: {
      poOrder: edittable?.poOrder || nextPONumber || "",
      date: edittable?.date || new Date().toISOString().split("T")[0],
      supplierIdentifier:
        edittable?.supplierName || edittable?.companyName || "",
      supplierName: edittable?.supplierName || "",
      supplierEmail: edittable?.supplierEmail || "",
      supplierShippedTo: edittable?.supplierShippedTo || "",
      supplierBillTo: edittable?.supplierBillTo || "",
      supplierShippedGSTIN: edittable?.supplierShippedGSTIN || "",
      supplierBillGSTIN: edittable?.supplierBillGSTIN || "",
      supplierType: edittable?.supplierType || "Individual",
      GSTApply: edittable?.GSTApply || "",
      modeOfPayment: edittable?.modeOfPayment || "",
      billingAddress: edittable?.billingAddress || "",
      paymentTerms: edittable?.paymentTerms || "",
      additionalRemarks: edittable?.additionalRemarks || "",
      additionalImportant: edittable?.additionalImportant || "",
      items:
        edittable?.items?.map((item) => ({
          ...item,
          productId: item.productId || "", // Ensure productId field exists
        })) ||
        (edittable?.itemName
          ? [
              {
                itemName: edittable.itemName,
                quantity: edittable.quantity || 1,
                unitPrice: 0,
                totalPrice: 0,
                productId: "",
              },
            ]
          : [
              {
                itemName: "",
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                productId: "",
              },
            ]),
      isSameAddress: edittable?.isSameAddress || false,
    },
    validationSchema,
    enableReinitialize: true,
    validateOnMount: false, // Prevent validation on initial render
    validateOnChange: true, // Validate on field change
    validateOnBlur: true, // Validate on field blur
    onSubmit: async (values) => {
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);

      const payload = {
        ...values,
        supplierName: values.supplierIdentifier,
      };

      try {
        if (edittable?._id) {
          const res = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}purchase-order/${edittable._id}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          if (res.data.success) {
            // Remove items from inventory shortages if they have updates
            for (const item of values.items) {
              const selectedProduct = rawMaterials.find(
                (material) => material.name === item.itemName
              );
              if (selectedProduct?._id) {
                try {
                  await axios.put(
                    `${process.env.REACT_APP_BACKEND_URL}product/remove-from-shortages`,
                    {
                      productId: selectedProduct._id,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${cookies?.access_token}`,
                      },
                    }
                  );
                } catch (shortageError) {
                  // Ignore shortage removal errors - item might not be in shortages
                  console.log(
                    "Item not in shortages or no updates:",
                    shortageError
                  );
                }
              }
            }

            toast.success("Purchase order updated successfully!");
            if (fetchPurchaseOrderData) {
              fetchPurchaseOrderData();
            }
            setTimeout(() => {
              closeDrawerHandler();
            }, 2000);
          }
        } else {
          const res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}purchase-order/`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );

          if (res.data.success) {
            // Remove items from inventory shortages if they have updates
            for (const item of values.items) {
              const selectedProduct = rawMaterials.find(
                (material) => material.name === item.itemName
              );
              if (selectedProduct?._id) {
                try {
                  await axios.put(
                    `${process.env.REACT_APP_BACKEND_URL}product/remove-from-shortages`,
                    {
                      productId: selectedProduct._id,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${cookies?.access_token}`,
                      },
                    }
                  );
                } catch (shortageError) {
                  // Ignore shortage removal errors - item might not be in shortages
                  console.log(
                    "Item not in shortages or no updates:",
                    shortageError
                  );
                }
              }
            }

            toast.success("Purchase order created successfully!");
            formik.resetForm();
            if (fetchPurchaseOrderData) {
              fetchPurchaseOrderData();
            }
            setTimeout(() => {
              closeDrawerHandler();
            }, 2000);
          }
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          "Something went wrong while saving purchase order!";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fetchSuppliersHandler = async (retryCount = 0) => {
    setIsLoadingSuppliers(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}purchase-order/suppliers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const data: SupplierApiResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      const suppliers = data.suppliers
        .map((supplier) => ({
          id: supplier.id,
          supplierName: supplier.supplierName || "",
          companyName: supplier.companyName || "",
          supplierType: supplier.supplierType || "Individual",
          supplierEmail: supplier.supplierEmail || "",
          supplierShippedTo: supplier.supplierShippedTo || "",
          supplierBillTo: supplier.supplierBillTo || "",
          supplierShippedGSTIN: supplier.supplierShippedGSTIN || "",
          supplierBillGSTIN: supplier.supplierBillGSTIN || "",
        }))
        .filter(
          (supplier) =>
            supplier.supplierName.trim() || supplier.companyName.trim()
        );
      setSupplierOptions(suppliers);
      if (suppliers.length === 0 && retryCount < 3) {
        setTimeout(() => fetchSuppliersHandler(retryCount + 1), 1000);
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchNextPONumber = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}purchase-order/next-po-number`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNextPONumber(data.poNumber);
        formik.setFieldValue("poOrder", data.poNumber);
      }
    } catch (error: any) {
      console.error("Error fetching next PO number:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchNextPONumber(); // Fetch PO number first
      await fetchSuppliersHandler(); // Then fetch suppliers
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}product/raw-materials`,
          {
            headers: { Authorization: `Bearer ${cookies?.access_token}` },
          }
        );
        setRawMaterials(res.data.rawMaterials || []);
      } catch (error) {
        console.error("Error fetching raw materials:", error);
      }
    };
    fetchData();
    formik.setTouched({}, false); // Reset touched state on mount
  }, []);

  useEffect(() => {
    if (edittable && supplierOptions.length > 0) {
      const isValidSupplier = supplierOptions.some(
        (supplier) =>
          supplier.supplierName === edittable.supplierName ||
          supplier.companyName === edittable.supplierName
      );
      if (!isValidSupplier && edittable.supplierName) {
        toast.warn(
          "Selected supplier is not available. Please choose a new supplier."
        );
        formik.setFieldValue("supplierIdentifier", "");
        formik.setFieldValue("supplierName", "");
      } else if (!edittable.supplierName && !edittable.companyName) {
        formik.setFieldValue("supplierIdentifier", "");
        formik.setFieldValue("supplierName", "");
      }
    }
  }, [edittable, supplierOptions]);

  useEffect(() => {
    if (formik.values.isSameAddress) {
      // Copy shipped address to bill address
      formik.setFieldValue("supplierBillTo", formik.values.supplierShippedTo);
      // Copy shipped GSTIN to bill GSTIN if shipped GSTIN exists
      if (formik.values.supplierShippedGSTIN) {
        formik.setFieldValue(
          "supplierBillGSTIN",
          formik.values.supplierShippedGSTIN
        );
      }
    }
  }, [
    formik.values.supplierShippedTo,
    formik.values.supplierShippedGSTIN,
    formik.values.isSameAddress,
  ]);

  // Function to fetch supplier details and auto-fill form
  const handleSupplierSelection = async (supplierIdentifier: string) => {
    const selectedSupplier = supplierOptions.find(
      (supplier) =>
        supplier.supplierName === supplierIdentifier ||
        supplier.companyName === supplierIdentifier
    );

    console.log("Selected supplier from list:", selectedSupplier);

    if (selectedSupplier) {
      // First set the basic data from the initial supplier list
      formik.setFieldValue(
        "supplierName",
        selectedSupplier.supplierName || selectedSupplier.companyName
      );
      formik.setFieldValue(
        "supplierEmail",
        selectedSupplier.supplierEmail || ""
      );
      formik.setFieldValue(
        "supplierShippedTo",
        selectedSupplier.supplierShippedTo || ""
      );
      formik.setFieldValue(
        "supplierBillTo",
        selectedSupplier.supplierBillTo || ""
      );
      formik.setFieldValue(
        "supplierShippedGSTIN",
        selectedSupplier.supplierShippedGSTIN || ""
      );
      formik.setFieldValue(
        "supplierBillGSTIN",
        selectedSupplier.supplierBillGSTIN || ""
      );
      formik.setFieldValue(
        "supplierType",
        selectedSupplier.supplierType || "Individual"
      );

      // Then fetch detailed supplier information from the API
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}purchase-order/supplier/${selectedSupplier.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${cookies?.access_token}`,
            },
          }
        );

        const data = await response.json();
        console.log("API response data:", data);

        if (data.success && data.supplier) {
          const supplier = data.supplier;
          console.log("Supplier details from API:", supplier);

          // Override with detailed data from API
          formik.setFieldValue(
            "supplierName",
            supplier.supplierName ||
              supplier.companyName ||
              selectedSupplier.supplierName ||
              selectedSupplier.companyName
          );
          formik.setFieldValue(
            "supplierEmail",
            supplier.supplierEmail || selectedSupplier.supplierEmail || ""
          );
          formik.setFieldValue(
            "supplierShippedTo",
            supplier.supplierShippedTo ||
              selectedSupplier.supplierShippedTo ||
              ""
          );
          formik.setFieldValue(
            "supplierBillTo",
            supplier.supplierBillTo || selectedSupplier.supplierBillTo || ""
          );
          formik.setFieldValue(
            "supplierShippedGSTIN",
            supplier.supplierShippedGSTIN ||
              selectedSupplier.supplierShippedGSTIN ||
              ""
          );
          formik.setFieldValue(
            "supplierBillGSTIN",
            supplier.supplierBillGSTIN ||
              selectedSupplier.supplierBillGSTIN ||
              ""
          );
          formik.setFieldValue(
            "supplierType",
            supplier.supplierType ||
              selectedSupplier.supplierType ||
              "Individual"
          );

          console.log("Form values after setting:", {
            supplierEmail: formik.values.supplierEmail,
            supplierShippedTo: formik.values.supplierShippedTo,
            supplierBillTo: formik.values.supplierBillTo,
            supplierType: formik.values.supplierType,
            supplierShippedGSTIN: formik.values.supplierShippedGSTIN,
            supplierBillGSTIN: formik.values.supplierBillGSTIN,
          });
        }
      } catch (error) {
        console.error("Error fetching supplier details:", error);
        toast.error("Failed to fetch supplier details");
      }
    }
  };

  // Functions to manage items
  const addItem = () => {
    const newItems = [
      ...formik.values.items,
      {
        itemName: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        productId: "",
      },
    ];
    formik.setFieldValue("items", newItems);
  };

  const removeItem = (index: number) => {
    if (formik.values.items.length > 1) {
      const newItems = formik.values.items.filter((_, i) => i !== index);
      formik.setFieldValue("items", newItems);
    }
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...formik.values.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If item name is being updated, also update the product_id
    if (field === "itemName") {
      const selectedMaterial = rawMaterials.find(
        (material) => material.name === value
      );
      if (selectedMaterial) {
        newItems[index].productId = selectedMaterial.product_id;
      }
    }

    // Auto-calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    formik.setFieldValue("items", newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        false
      );
      return;
    }
    formik.handleSubmit();
  };

  return (
    <>
      <div
        className="absolute overflow-auto h-[100vh] w-[100vw] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
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
            {edittable ? "Edit Purchase Order" : "Add New Purchase Order"}
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

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <Card
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <CardBody p={6}>
                  <Flex align="center" gap={3} mb={6}>
                    <Box p={2} bg="green.50" borderRadius="lg">
                      <BiPackage size={20} color="#38A169" />
                    </Box>
                    <Heading size="md" color={headingColor}>
                      Purchase Order
                    </Heading>
                  </Flex>

                  {/*  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={6}
                  >
                    <GridItem>
                      <FormControl isInvalid={hasError("poOrder")}>
                        <FormLabel
                          display="flex"
                          alignItems="center"
                          gap={2}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <FileSpreadsheet size={16} />
                          P.O. Number (Auto-generated) *
                        </FormLabel>
                        <Input
                          name="poOrder"
                          value={formik.values.poOrder}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter PO order number"
                          size="lg"
                          borderRadius="lg"
                          isReadOnly
                          bg="gray.50"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182CE",
                          }}
                        />
                        {getErrorMessage("poOrder") && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {getErrorMessage("poOrder")}
                          </Text>
                        )}
                      </FormControl>
                    </GridItem> 

                    <GridItem>*/}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-5">
                    <FormControl isInvalid={hasError("date")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        <BiCalendar size={16} />
                        Order Date *
                      </FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={formik.values.date}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3182CE",
                        }}
                      />
                      {getErrorMessage("date") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("date")}
                        </Text>
                      )}
                    </FormControl>
                    {/* </GridItem> */}

                    {/* <GridItem> */}
                    <FormControl isInvalid={hasError("supplierIdentifier")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        <BiUser size={16} />
                        Supplier Name *
                      </FormLabel>
                      <Select
                        placeholder={
                          isLoadingSuppliers
                            ? "Loading suppliers..."
                            : "Select Supplier"
                        }
                        isDisabled={isLoadingSuppliers}
                        name="supplierIdentifier"
                        value={formik.values.supplierIdentifier}
                        onChange={(e) => {
                          const selectedIdentifier = e.target.value;
                          formik.setFieldValue(
                            "supplierIdentifier",
                            selectedIdentifier
                          );
                          if (selectedIdentifier) {
                            handleSupplierSelection(selectedIdentifier);
                          }
                        }}
                        size="lg"
                        borderRadius="lg"
                      >
                        {supplierOptions.length > 0 ? (
                          supplierOptions.map((supplier) => {
                            const displayText =
                              supplier.supplierName ||
                              supplier.companyName ||
                              "Unknown Supplier";
                            const value =
                              supplier.supplierName ||
                              supplier.companyName ||
                              "";
                            return (
                              <option key={supplier.id} value={value}>
                                {displayText}
                                {supplier.supplierName &&
                                  supplier.companyName &&
                                  ` (${supplier.companyName})`}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>
                            {isLoadingSuppliers
                              ? "Loading..."
                              : "No suppliers available"}
                          </option>
                        )}
                      </Select>
                      {getErrorMessage("supplierIdentifier") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("supplierIdentifier")}
                        </Text>
                      )}
                    </FormControl>
                    {/* </GridItem>

                    <GridItem> */}
                    <FormControl isInvalid={hasError("supplierType")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        <Users size={16} />
                        Supplier Type *
                      </FormLabel>
                      <Select
                        placeholder="Select Supplier Type"
                        name="supplierType"
                        value={formik.values.supplierType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        size="lg"
                        borderRadius="lg"
                      >
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                      </Select>
                      {getErrorMessage("supplierType") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("supplierType")}
                        </Text>
                      )}
                    </FormControl>
                  </div>
                  {/* </GridItem>

                    <GridItem colSpan={2}> */}
                  {/* Items Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        Items
                      </h3>
                      <Button
                        onClick={addItem}
                        colorScheme="blue"
                        size="sm"
                        leftIcon={<BiPackage />}
                      >
                        Add Item
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formik.values.items.map((item, index) => (
                        <Card key={index} mb={4} variant="outline">
                          <CardBody>
                            <div className="flex items-center justify-between mb-4">
                              <h4
                                className="font-medium"
                                style={{ color: colors.text.secondary }}
                              >
                                Item {index + 1}
                              </h4>
                              {formik.values.items.length > 1 && (
                                <IconButton
                                  aria-label="Remove item"
                                  icon={<BiX />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => removeItem(index)}
                                />
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <FormControl
                                isInvalid={
                                  formik.touched.items?.[index]?.itemName &&
                                  formik.errors.items?.[index]?.itemName
                                }
                              >
                                <FormLabel>Item Name *</FormLabel>
                                <Select
                                  placeholder="Select Item"
                                  value={item.itemName}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "itemName",
                                      e.target.value
                                    )
                                  }
                                  size="lg"
                                  borderRadius="lg"
                                >
                                  {rawMaterials.map((material) => (
                                    <option
                                      key={material._id}
                                      value={material.name}
                                    >
                                      {material.name}
                                    </option>
                                  ))}
                                </Select>
                                {formik.touched.items?.[index]?.itemName &&
                                  formik.errors.items?.[index]?.itemName && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                      {formik.errors.items[index].itemName}
                                    </Text>
                                  )}
                              </FormControl>

                              <FormControl>
                                <FormLabel>Product ID</FormLabel>
                                <Input
                                  value={item.productId || ""}
                                  placeholder="Product ID"
                                  size="lg"
                                  borderRadius="lg"
                                  isReadOnly
                                  bg="gray.50"
                                />
                              </FormControl>

                              <FormControl
                                isInvalid={
                                  formik.touched.items?.[index]?.quantity &&
                                  formik.errors.items?.[index]?.quantity
                                }
                              >
                                <FormLabel>Quantity *</FormLabel>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "quantity",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="Enter quantity"
                                  size="lg"
                                  borderRadius="lg"
                                  min="1"
                                />
                                {formik.touched.items?.[index]?.quantity &&
                                  formik.errors.items?.[index]?.quantity && (
                                    <Text color="red.500" fontSize="sm" mt={1}>
                                      {formik.errors.items[index].quantity}
                                    </Text>
                                  )}
                              </FormControl>

                              <FormControl>
                              <FormLabel>Unit Price</FormLabel>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="Enter unit price"
                                size="lg"
                                borderRadius="lg"
                                min="0"
                                step="0.01"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Total Price</FormLabel>
                              <Input
                                type="number"
                                value={item.totalPrice}
                                isReadOnly
                                placeholder="Auto-calculated"
                                size="lg"
                                borderRadius="lg"
                                bg="gray.50"
                              />
                            </FormControl>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-5">
                    <FormControl isInvalid={hasError("supplierEmail")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        <Mail size={16} />
                        Email
                      </FormLabel>
                      <Input
                        name="supplierEmail"
                        type="email"
                        value={formik.values.supplierEmail}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter supplier email address"
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3182CE",
                        }}
                      />
                      {getErrorMessage("supplierEmail") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("supplierEmail")}
                        </Text>
                      )}
                    </FormControl>
                  </div>
                  {/* </GridItem>
                    <br />
                    <GridItem> */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                    <FormControl isInvalid={hasError("supplierShippedTo")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        <MapPin size={16} />
                        Shipped To *
                      </FormLabel>
                      <Input
                        name="supplierShippedTo"
                        value={formik.values.supplierShippedTo}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter shipping address"
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3182CE",
                        }}
                      />
                      {getErrorMessage("supplierShippedTo") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("supplierShippedTo")}
                        </Text>
                      )}
                    </FormControl>
                    {/* </GridItem>

                    <GridItem> */}
                    {formik.values.supplierType === "Company" && (
                      <FormControl isInvalid={hasError("supplierShippedGSTIN")}>
                        <FormLabel
                          display="flex"
                          alignItems="center"
                          gap={2}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <FileSpreadsheet size={16} />
                          Shipped GSTIN (Optional)
                        </FormLabel>
                        <Input
                          name="supplierShippedGSTIN"
                          value={formik.values.supplierShippedGSTIN}
                          onChange={(e) => {
                            const uppercase = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                            formik.setFieldValue(
                              "supplierShippedGSTIN",
                              uppercase.slice(0, 15)
                            );
                          }}
                          onBlur={formik.handleBlur}
                          placeholder="Enter shipped GSTIN"
                          size="lg"
                          borderRadius="lg"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182CE",
                          }}
                          isDisabled={formik.values.isSameAddress}
                        />
                        {getErrorMessage("supplierShippedGSTIN") && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {getErrorMessage("supplierShippedGSTIN")}
                          </Text>
                        )}
                      </FormControl>
                    )}
                  </div>
                  {/* </GridItem>

                    <GridItem colSpan={2}> */}
                  <br />
                  {/* <GridItem> */}
                  <FormControl>
                    <Checkbox
                      name="isSameAddress"
                      isChecked={formik.values.isSameAddress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        formik.handleChange(e);
                        if (e.target.checked) {
                          // Copy shipped address to bill address
                          formik.setFieldValue(
                            "supplierBillTo",
                            formik.values.supplierShippedTo
                          );
                          // Copy shipped GSTIN to bill GSTIN if shipped GSTIN exists
                          if (formik.values.supplierShippedGSTIN) {
                            formik.setFieldValue(
                              "supplierBillGSTIN",
                              formik.values.supplierShippedGSTIN
                            );
                          }
                        } else {
                          // Reset to original values when unchecked
                          formik.setFieldValue(
                            "supplierBillTo",
                            edittable?.supplierBillTo || ""
                          );
                          formik.setFieldValue(
                            "supplierBillGSTIN",
                            edittable?.supplierBillGSTIN || ""
                          );
                        }
                      }}
                      size="lg"
                    >
                      Same as Shipped To
                    </Checkbox>
                  </FormControl>
                  {/* </GridItem>

<GridItem> */}
                  <br />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                    <FormControl isInvalid={hasError("supplierBillTo")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        <MapPin size={16} />
                        Bill To *
                      </FormLabel>
                      <Input
                        name="supplierBillTo"
                        value={formik.values.supplierBillTo}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter billing address"
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3182CE",
                        }}
                        isDisabled={formik.values.isSameAddress}
                      />
                      {getErrorMessage("supplierBillTo") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("supplierBillTo")}
                        </Text>
                      )}
                    </FormControl>
                    {/* </GridItem>

                    <GridItem> */}
                    {formik.values.supplierType === "Company" && (
                      <FormControl isInvalid={hasError("supplierBillGSTIN")}>
                        <FormLabel
                          display="flex"
                          alignItems="center"
                          gap={2}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <FileSpreadsheet size={16} />
                          Bill GSTIN (Optional)
                        </FormLabel>
                        <Input
                          name="supplierBillGSTIN"
                          value={formik.values.supplierBillGSTIN}
                          onChange={(e) => {
                            const uppercase = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                            formik.setFieldValue(
                              "supplierBillGSTIN",
                              uppercase.slice(0, 15)
                            );
                          }}
                          onBlur={formik.handleBlur}
                          placeholder="Enter bill GSTIN"
                          size="lg"
                          borderRadius="lg"
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182CE",
                          }}
                          isDisabled={formik.values.isSameAddress}
                        />
                        {getErrorMessage("supplierBillGSTIN") && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {getErrorMessage("supplierBillGSTIN")}
                          </Text>
                        )}
                      </FormControl>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <CardBody p={6}>
                  <Flex align="center" gap={3} mb={6}>
                    <Box p={2} bg="purple.50" borderRadius="lg">
                      <FileSpreadsheet size={20} color="#805AD5" />
                    </Box>
                    <Heading size="md" color={headingColor}>
                      Terms and Conditions
                    </Heading>
                  </Flex>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FormControl isInvalid={hasError("GSTApply")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        GST Applicable *
                      </FormLabel>
                      <Select
                        name="GSTApply"
                        value={formik.values.GSTApply}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Select"
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px #805AD5",
                        }}
                      >
                        <option value="igst">IGST - 18%</option>
                        <option value="cgst/sgst">CGST - 9%, SGST - 9%</option>
                      </Select>
                      {getErrorMessage("GSTApply") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("GSTApply")}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl isInvalid={hasError("modeOfPayment")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        Mode of Payment *
                      </FormLabel>
                      <Select
                        name="modeOfPayment"
                        value={formik.values.modeOfPayment}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Select"
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px #805AD5",
                        }}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit">Credit</option>
                      </Select>
                      {getErrorMessage("modeOfPayment") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("modeOfPayment")}
                        </Text>
                      )}
                    </FormControl>

                    {/* <FormControl isInvalid={hasError("billingAddress")}>
                      <FormLabel
                        display="flex"
                        alignItems="center"
                        gap={2}
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        Billing Address *
                      </FormLabel>
                      <Input
                        name="billingAddress"
                        value={formik.values.billingAddress}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter billing address"
                        size="lg"
                        borderRadius="lg"
                        _focus={{
                          borderColor: "purple.500",
                          boxShadow: "0 0 0 1px #805AD5",
                        }}
                      />
                      {getErrorMessage("billingAddress") && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          {getErrorMessage("billingAddress")}
                        </Text>
                      )}
                    </FormControl> */}
                  </div>
                </CardBody>
              </Card>

              <Card
                bg={bgColor}
                border="1px"
                borderColor={borderColor}
                shadow="sm"
              >
                <CardBody p={6}>
                  <Flex align="center" gap={3} mb={6}>
                    <Box p={2} bg="orange.50" borderRadius="lg">
                      <BiEdit size={20} color="#DD6B20" />
                    </Box>
                    <Heading size="md" color={headingColor}>
                      Remarks
                    </Heading>
                  </Flex>

                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                    gap={4}
                  >
                    <GridItem>
                      <FormControl isInvalid={hasError("additionalImportant")}>
                        <FormLabel
                          display="flex"
                          alignItems="center"
                          gap={2}
                          color={textColor}
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          <BiEdit size={16} />
                          Additional Important Terms
                        </FormLabel>
                        <Textarea
                          name="additionalImportant"
                          value={formik.values.additionalImportant}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter any additional terms"
                          size="md"
                          borderRadius="lg"
                          rows={3}
                          style={{
                            height: "calc(3em + 4px)",
                            width: "calc(100% + 4px)",
                          }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182CE",
                          }}
                        />
                        {getErrorMessage("additionalImportant") && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {getErrorMessage("additionalImportant")}
                          </Text>
                        )}
                      </FormControl>
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>

              <Box pt={6} borderTop="1px" borderColor={borderColor}>
                <HStack spacing={4} justify="end">
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    size="lg"
                    onClick={closeDrawerHandler}
                    px={8}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                    loadingText={edittable ? "Updating..." : "Creating..."}
                    px={8}
                    bgGradient="linear(to-r, blue.600, blue.700)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.700, blue.800)",
                    }}
                  >
                    {edittable
                      ? "Update Purchase Order"
                      : "Create Purchase Order"}
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </div>
      </div>
    </>
  );
};

export default AddPurchaseOrder;
