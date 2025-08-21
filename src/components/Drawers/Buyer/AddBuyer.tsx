import { useState } from "react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useAddAgentMutation } from "../../../redux/api/api";
import { colors } from "../../../theme/colors";

interface AddBuyerProps {
  closeDrawerHandler: () => void;
  fetchBuyersHandler: () => void;
}

const AddBuyer: React.FC<AddBuyerProps> = ({
  closeDrawerHandler,
  fetchBuyersHandler,
}) => {
  const [isAddingBuyer, setIsAddingBuyer] = useState<boolean>(false);
  const [name, setName] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [gst, setGst] = useState<string | undefined>();
  const [companyName, setCompanyName] = useState<string | undefined>();
  const [companyEmail, setCompanyEmail] = useState<string | undefined>();
  const [companyPhone, setCompanyPhone] = useState<string | undefined>();
  const [addressLine1, setAddressLine1] = useState<string | undefined>();
  const [addressLine2, setAddressLine2] = useState<string | undefined>();
  const [pincode, setPincode] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();

  const [addBuyer] = useAddAgentMutation();

  const addBuyerHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !email ||
      !phone ||
      !companyName ||
      !companyEmail ||
      !companyPhone ||
      !addressLine1 ||
      !city ||
      !state ||
      name.trim().length === 0 ||
      email.trim().length === 0 ||
      phone.trim().length === 0 ||
      companyName.trim().length === 0 ||
      companyEmail.trim().length === 0 ||
      companyPhone.trim().length === 0 ||
      addressLine1.trim().length === 0 ||
      city.trim().length === 0 ||
      state.trim().length === 0
    ) {
      toast.error("Please provide all the fields");
      return;
    }

    try {
      setIsAddingBuyer(true);
      const response = await addBuyer({
        agent_type: "buyer",
        name,
        email,
        phone,
        gst_number: gst,
        company_name: companyName,
        company_email: companyEmail,
        company_phone: companyPhone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        pincode: pincode,
        city,
        state,
      }).unwrap();
      toast.success(response.message);
      fetchBuyersHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsAddingBuyer(false);
    }
  };

  return (
    <Drawer closeDrawerHandler={closeDrawerHandler}>
      <div
        className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[450px] bg-white right-0 top-0 z-10 py-3 border-l border-gray-200"
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
            Add New Buyer
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
          <h2 className="text-xl text-center  font-semi600 py-3 px-4 bg-[#ffffff4f]  rounded-md text-white  mb-6  ">
            Add New Buyer
          </h2>

          <form onSubmit={addBuyerHandler}>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Name
              </FormLabel>
              <Input
                className="text-gray-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Name"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Email
              </FormLabel>
              <Input
                className="text-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Phone
              </FormLabel>
              <Input
                value={phone}
                className="no-scrollbar text-gray-200"
                onChange={(e) => setPhone(e.target.value)}
                type="number"
                placeholder="Phone"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="white">
                GST Number
              </FormLabel>
              <Input
                value={gst}
                className="no-scrollbar text-gray-200"
                onChange={(e) => setGst(e.target.value)}
                type="text"
                placeholder="GST Number"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Company Name
              </FormLabel>
              <Input
                className="no-scrollbar text-gray-200"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                type="text"
                placeholder="Company Name"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Current Email
              </FormLabel>
              <Input
                className="text-gray-200"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                type="email"
                placeholder="Company Email"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Company Phone
              </FormLabel>
              <Input
                className="text-gray-200"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                type="number"
                placeholder="Company Phone"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                Address Line 1
              </FormLabel>
              <Input
                className="text-gray-200"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                type="text"
                placeholder="Address Line 1"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="white">
                Address Line 2
              </FormLabel>
              <Input
                className="text-gray-200"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                type="text"
                placeholder="Address Line 2"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="white">
                Pincode
              </FormLabel>
              <Input
                className="text-gray-200"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                type="text"
                placeholder="Pincode"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                City
              </FormLabel>
              <Input
                className="text-gray-200"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                type="text"
                placeholder="City"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="white">
                State
              </FormLabel>
              <Input
                className="text-gray-200"
                value={state}
                onChange={(e) => setState(e.target.value)}
                type="text"
                placeholder="State"
              />
            </FormControl>
            <Button
              isLoading={isAddingBuyer}
              type="submit"
              className="mt-1"
              color="white"
              backgroundColor="#ffffff8a"
              _hover={{ bg: "#d1d2d5" }}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </Drawer>
  );
};

export default AddBuyer;
