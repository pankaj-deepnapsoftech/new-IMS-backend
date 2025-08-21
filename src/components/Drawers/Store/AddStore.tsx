import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { useState } from "react";
import { useAddStoreMutation } from "../../../redux/api/api";
import { toast } from "react-toastify";
import { colors } from "../../../theme/colors";
import { useCookies } from "react-cookie";

interface AddStoreProps {
  fetchStoresHandler: () => void;
  closeDrawerHandler: () => void;
}

const AddStore: React.FC<AddStoreProps> = ({
  closeDrawerHandler,
  fetchStoresHandler,
}) => {
  const [cookies, setCookie] = useCookies();
  const [isAddingStore, setIsAddingStore] = useState<boolean>(false);
  const [name, setName] = useState<string | undefined>();
  const [gst, setGst] = useState<string | undefined>();
  const [addressLine1, setAddressLine1] = useState<string | undefined>();
  const [addressLine2, setAddressLine2] = useState<string | undefined>();
  const [pincode, setPincode] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();

  const [addStore] = useAddStoreMutation();

  const addStoreHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      !addressLine1 ||
      !city ||
      !state ||
      name.trim().length === 0 ||
      addressLine1.trim().length === 0 ||
      city.trim().length === 0 ||
      state.trim().length === 0
    ) {
      toast.error("Please provide all the required fields");
      return;
    }
    try {
      setIsAddingStore(true);
      const response = await addStore({
        name: name,
        gst_number: gst,
        address_line1: addressLine1,
        address_line2: addressLine2,
        pincode: pincode,
        city: city,
        state: state,
      }).unwrap();
      toast.success(response.message);
      fetchStoresHandler();
      closeDrawerHandler();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsAddingStore(false);
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
            Add New Store
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
          <form onSubmit={addStoreHandler}>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="black">
                Store Name
              </FormLabel>
              <Input
                className="text-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Product Name"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="black">
                GST Number
              </FormLabel>
              <Input
                className="text-gray-800"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                type="text"
                placeholder="GST Number"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="black">
                Address Line 1
              </FormLabel>
              <Input
                value={addressLine1}
                className="no-scrollbar text-gray-800"
                onChange={(e) => setAddressLine1(e.target.value)}
                type="text"
                placeholder="Address Line 1"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="black">
                Address Line 2
              </FormLabel>
              <Input
                value={addressLine2}
                className="no-scrollbar text-gray-800"
                onChange={(e) => setAddressLine2(e.target.value)}
                type="text"
                placeholder="Address Line 2"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5">
              <FormLabel fontWeight="bold" color="black">
                Pincode
              </FormLabel>
              <Input
                className="no-scrollbar text-gray-800"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                type="text"
                placeholder="Pincode"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="black">
                City
              </FormLabel>
              <Input
                className="text-gray-800"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                type="text"
                placeholder="City"
              />
            </FormControl>
            <FormControl className="mt-3 mb-5" isRequired>
              <FormLabel fontWeight="bold" color="black">
                State
              </FormLabel>
              <Input
                className="text-gray-800"
                value={state}
                onChange={(e) => setState(e.target.value)}
                type="text"
                placeholder="State"
              />
            </FormControl>
            <Button
              isLoading={isAddingStore}
              type="submit"
              className="mt-1"
              color="white"
              backgroundColor="#3b82f6"
              _hover={{ bg: "#3b82f6" }}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </Drawer>
  );
};

export default AddStore;
