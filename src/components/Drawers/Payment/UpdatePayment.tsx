import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  useUpdatePaymentMutation,
} from "../../../redux/api/api";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";

interface UpdatePayment {
  closeDrawerHandler: () => void;
  fetchPaymentsHandler: () => void;
  id: string | undefined;
}

const UpdatePayment: React.FC<UpdatePayment> = ({ closeDrawerHandler, fetchPaymentsHandler, id }) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [amount, setAmount] = useState<number | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [paymentId, setPaymentId] = useState<string | undefined>();
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

  const [updatePayment] = useUpdatePaymentMutation();

  const updatePaymentHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if((invoiceBalance || 0) < (amount || 0)){
      toast.error('Amount must be less than the balance amount');
      return;
    }

    const data = {
      _id: paymentId,
      amount: amount,
      description: description,
      mode: mode?.value
    };

    try {
      setIsUpdating(true);
      const response = await updatePayment(data).unwrap();
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchPaymentDetails = async (id: string) => {
    try {
      setIsLoading(true);
      // @ts-ignore
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + `payment/${id}`,
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
      setInvoiceBalance(data.payment.invoice.balance);
      setInvoiceTotal(data.payment.invoice.total);
      setPaymentId(data.payment._id);
      setMode({value: data.payment.mode, label: data.payment.mode});
      setDescription(data.payment?.description);
      setAmount(data.payment.amount);
    } catch (error: any) {
      toast.error(error.messsage || "Something went wrong");
    } finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails(id || "");
  }, [id]);

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[450px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        <BiX onClick={closeDrawerHandler} size="26px" />
        Payment
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-semibold py-5 text-center mb-6 border-y bg-[#f9fafc]">
          Edit Payment
        </h2>

        <div>
          <h2 className="text-xl font-semibold py-5 text-center mb-6 border-y bg-[#f9fafc]">
            Invoice Details
          </h2>
          <p className="mt-1"><span className="font-bold">Total</span>: ₹ {invoiceTotal}/-</p>
          <p className="mt-1"><span className="font-bold">Balance</span>: ₹ {invoiceBalance}/-</p>
        </div>

        <form onSubmit={updatePaymentHandler}>
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold">Amount</FormLabel>
            <Input
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
              type="number"
              placeholder="Amount"
            />
          </FormControl>
          <FormControl className="mt-3 mb-5">
            <FormLabel fontWeight="bold">Description</FormLabel>
            <Input
              value={description}
              className="no-scrollbar"
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              placeholder="Description"
            />
          </FormControl>
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold">Mode</FormLabel>
            <Select
              options={modeOptions}
              value={mode}
              onChange={(e: any) => setMode(e)}
              required={true}
            />
          </FormControl>
          <Button
            isLoading={isUpdating}
            type="submit"
            className="mt-1"
            color="white"
            backgroundColor="#1640d6"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePayment;
