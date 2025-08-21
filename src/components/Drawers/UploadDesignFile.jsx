// @ts-nocheck
import React, { useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { useCookies } from "react-cookie";

const UploadDesignFile = ({ show, setShow, saleId, refresh }) => {
  const [cookies] = useCookies();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImage = async (formData) => {
    try {
      const res = await axios.post(
        "https://images.deepmart.shop/upload",
        formData
      );
      return res.data?.[0]; // return image URL
    } catch (error) {
      toast.error("Image Upload Failed");
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file || isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", file);
    const uploadedUrl = await uploadImage(formData);

    if (uploadedUrl) {
      try {
        await axios.patch(
          `${process.env.REACT_APP_BACKEND_URL}sale/upload-image/${saleId}`,
          { designFile: uploadedUrl },
          { headers: { Authorization: `Bearer ${cookies.access_token}` } }
        );
        toast.success("Design uploaded successfully");
        setShow(false);
        refresh();
      } catch (err) {
        console.log(err);
        toast.error("Upload failed");
      }
    }

    setIsSubmitting(false);
  };

  return (
    <Drawer isOpen={show} placement="right" onClose={() => setShow(false)}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Upload Design File</DrawerHeader>
        <DrawerBody>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              setFile(f);
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          {preview && (
            <div className="mt-3 relative">
              <img
                src={preview}
                alt="Preview"
                className="rounded-md w-full mt-2"
              />
              <button
                type="button"
                className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
              >
                <IoClose />
              </button>
            </div>
          )}

          <Button
            mt={4}
            colorScheme="blue"
            isFullWidth
            onClick={handleUpload}
            isLoading={isSubmitting}
          >
            Upload
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default UploadDesignFile;
