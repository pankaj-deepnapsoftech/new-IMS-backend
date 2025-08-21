import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { MdAdd, MdAttachMoney, MdPayment } from "react-icons/md";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useCreatePaymentMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { colors } from "../../../theme/colors";

interface AddPayment {
  closeDrawerHandler: () => void;
  id: string | undefined;
}

const AddPayment: React.FC<AddPayment> = ({ closeDrawerHandler, id }) => {
  const [cookies] = useCookies();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [amount, setAmount] = useState<number | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [invoice, setInvoice] = useState<string | undefined>();
  const [mode, setMode] = useState<
    { value: string; label: string } | undefined
  >();
  const [invoiceTotal, setInvoiceTotal] = useState<number | undefined>();
  const [invoiceBalance, setInvoiceBalance] = useState<number | undefined>();

  const modeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "NEFT", label: "NEFT" },
    { value: "RTGS", label: "RTGS" },
    { value: "Cheque", label: "Cheque" },
  ];

  const [addPayment] = useCreatePaymentMutation();

  const addPaymentHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((invoiceBalance || 0) < (amount || 0)) {
      toast.error("Amount must be less than the balance amount");
      return;
    }

    const data = {
      amount: amount,
      description: description,
      mode: mode?.value,
      invoice: invoice,
    };

    try {
      setIsAdding(true);
      const response = await addPayment(data).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  const fetchInvoiceDetails = async (id: string) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + `invoice/${id}`,
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
      setInvoice(data.invoice._id);
      setInvoiceTotal(data.invoice.total);
      setInvoiceBalance(data.invoice.balance);
    } catch (error: any) {
      toast.error(error.messsage || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchInvoiceDetails(id || "");
  }, [id]);

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
      color: colors.text.muted,
    }),
  };

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[500px] right-0 top-0 z-10"
      style={{
        backgroundColor: colors.background.drawer,
        boxShadow: colors.shadow.xl,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 border-b"
        style={{ borderColor: colors.border.light }}
      >
        <h1
          className="text-xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          Add Payment
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

      {/* Content */}
      <div className="p-6">
        {/* Invoice Summary */}
        <div
          className="p-6 rounded-lg mb-6"
          style={{
            backgroundColor: colors.primary[50],
            border: `1px solid ${colors.primary[200]}`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: colors.primary[100] }}
            >
              <MdAttachMoney
                size={20}
                style={{ color: colors.primary[600] }}
              />
            </div>
            <h3
              className="font-semibold text-lg"
              style={{ color: colors.text.primary }}
            >
              Invoice Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div
                className="text-sm font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Total Amount
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: colors.text.primary }}
              >
                ₹{invoiceTotal?.toLocaleString()}
              </div>
            </div>
            <div>
              <div
                className="text-sm font-medium mb-1"
                style={{ color: colors.text.secondary }}
              >
                Remaining Balance
              </div>
              <div
                className="text-xl font-bold"
                style={{
                  color:
                    (invoiceBalance || 0) > 0
                      ? colors.error[600]
                      : colors.success[600],
                }}
              >
                ₹{invoiceBalance?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={addPaymentHandler} className="space-y-6">
          {/* Payment Amount */}
          <FormControl isRequired>
            <FormLabel
              className="text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Payment Amount
            </FormLabel>
            <Input
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              type="number"
              step="0.01"
              min="0.01"
              max={invoiceBalance}
              placeholder="Enter payment amount"
              className="w-full"
              style={{
                backgroundColor: colors.input.background,
                borderColor: colors.input.border,
                color: colors.text.primary,
                borderRadius: "8px",
                height: "44px",
              }}
              _focus={{
                borderColor: colors.input.borderFocus,
                boxShadow: `0 0 0 3px ${colors.primary[100]}`,
              }}
              _hover={{
                borderColor: colors.input.borderHover,
              }}
            />
            <div
              className="text-xs mt-1"
              style={{ color: colors.text.muted }}
            >
              Maximum amount: ₹{invoiceBalance?.toLocaleString()}
            </div>
          </FormControl>

          {/* Payment Mode */}
          <FormControl isRequired>
            <FormLabel
              className="text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Payment Mode
            </FormLabel>
            <Select
              value={mode}
              options={modeOptions}
              onChange={(e: any) => setMode(e)}
              styles={customSelectStyles}
              placeholder="Select payment mode"
            />
          </FormControl>

          {/* Description */}
          <FormControl>
            <FormLabel
              className="text-sm font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Description
            </FormLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter payment description or notes..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border resize-none focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: colors.input.background,
                borderColor: colors.input.border,
                color: colors.text.primary,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.input.borderFocus;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.input.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </FormControl>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeDrawerHandler}
              className="flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                color: colors.text.secondary,
                backgroundColor: colors.gray[100],
                border: `1px solid ${colors.border.light}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.gray[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.gray[100];
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isAdding
                  ? colors.gray[400]
                  : colors.success[600],
              }}
              onMouseEnter={(e) => {
                if (!isAdding) {
                  e.currentTarget.style.backgroundColor = colors.success[700];
                }
              }}
              onMouseLeave={(e) => {
                if (!isAdding) {
                  e.currentTarget.style.backgroundColor = colors.success[600];
                }
              }}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <MdPayment size={18} />
                  Add Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPayment;
