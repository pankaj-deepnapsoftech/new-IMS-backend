// @ts-nocheck

import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import Select from "react-select";
import Drawer from "../../../ui/Drawer";
import { BiX } from "react-icons/bi";
import { colors } from "../../../theme/colors";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import axios from "axios";
import { useCookies } from "react-cookie";

interface Resource {
  _id: string;
  type: string;
  name: string;
  specification?: string;
}

interface AddResourceProps {
  closeDrawerHandler: () => void;
  onResourceCreated?: (resource: Resource) => void;
  onResourceUpdated?: (resource: Resource) => void;
  editResource?: Resource | null;
}

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
};

const AddResource = ({
  onResourceCreated,
  closeDrawerHandler,
  fetchResourcesHandler,
  editResource,
}: AddResourceProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cookies] = useCookies();
  const [localEditResource] = useState(editResource);
  const [typeOptions, setTypeOptions] = useState([
    { value: "machine", label: "Machine" },
    { value: "assembly line", label: "Assembly Line" },
  ]);

  const [selectedType, setSelectedType] = useState(null);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newType, setNewType] = useState("");

  const handleAddNewType = () => {
    const trimmedType = newType.trim().toLowerCase();

    if (!trimmedType) {
      toast.warning("Type cannot be empty.");
      return;
    }

    const exists = typeOptions.some((opt) => opt.value === trimmedType);
    if (exists) {
      toast.warning("This type already exists.");
      return;
    }

    const newOption = { value: trimmedType, label: trimmedType };
    setTypeOptions((prev) => [...prev, newOption]);
    setSelectedType(newOption);
    formik.setFieldValue("type", trimmedType);
    setNewType("");
    setShowNewTypeInput(false);
    toast.success(`Type "${trimmedType}" added.`);
  };

  const formik = useFormik({
    initialValues: localEditResource || {
      type: "",
      name: "",
      specification: "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!values.type) {
        toast.error("Please select a machine type");
        return;
      }

      try {
        setIsSubmitting(true);

        let res;
        if (localEditResource) {
          res = await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}resources/${localEditResource._id}`,
            values,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Resource updated successfully");

          fetchResourcesHandler();
        } else {
          res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}resources/`,
            values,
            {
              headers: {
                Authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          toast.success("Resource created successfully");

          if (onResourceCreated) {
            onResourceCreated(res.data.resource);
          }
        }

        if (onResourceCreated) {
          onResourceCreated(res.data.resource);
        }

        console.log(res.data);
        resetForm();
        closeDrawerHandler();
      } catch (error) {
        toast.error("Failed to create/update resource");
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  useEffect(() => {
    if (editResource?.type) {
      const match = typeOptions.find((opt) => opt.value === editResource.type);
      if (match) {
        setSelectedType(match);
      } else {
        const newOption = {
          value: editResource.type,
          label: editResource.type,
        };
        setTypeOptions((prev) => [...prev, newOption]);
        setSelectedType(newOption);
      }
    }
  }, [editResource]);

  return (
    // <Drawer closeDrawerHandler={closeDrawerHandler}>

    // </Drawer>
    <div
      className="absolute overflow-auto h-[100vh] w-[99vw] md:w-[450px] bg-white right-0 top-0 z-50 py-3 border-l border-gray-200"
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
          {editResource ? "Edit Resource" : "Add New Resource"}
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
        <form onSubmit={formik.handleSubmit}>
          {/* Machine Type */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Resource Type
            </FormLabel>
            <Select
              className="rounded mt-2 border"
              placeholder="Select Resource Type"
              name="type"
              value={selectedType}
              options={[
                ...typeOptions,
                { value: "__add_new__", label: "+ Add New Type" },
              ]}
              styles={customStyles}
              onChange={(selected: any) => {
                if (selected?.value === "__add_new__") {
                  setShowNewTypeInput(true);
                } else {
                  setSelectedType(selected);
                  formik.setFieldValue("type", selected?.value || "");
                }
              }}
              onBlur={formik.handleBlur}
            />
            {showNewTypeInput && (
              <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <FormLabel
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.700"
                  mb={2}
                >
                  Add New Resource Type
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="Enter new type (e.g. Packaging)"
                    size="sm"
                    bg="white"
                    borderColor="gray.300"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px #3182ce",
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddNewType();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleAddNewType}
                    disabled={!newType.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewTypeInput(false);
                      setNewType("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </FormControl>

          {/* Name */}
          <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold" color="gray.700">
              Name
            </FormLabel>
            <Input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="text"
              placeholder="Name"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>

          {/* Specification */}
          <FormControl className="mt-3 mb-5">
            <FormLabel fontWeight="bold" color="gray.700">
              Specification
            </FormLabel>
            <Textarea
              name="specification"
              value={formik.values.specification}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Specification"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
              _placeholder={{ color: "gray.500" }}
              rows={4}
            />
          </FormControl>

          <Button
            isLoading={isSubmitting}
            type="submit"
            className="mt-5"
            colorScheme="blue"
            size="md"
            width="full"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddResource;
