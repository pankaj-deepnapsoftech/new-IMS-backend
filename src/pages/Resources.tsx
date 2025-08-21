//@ts-nocheck
import React, { useState, useEffect } from "react";
import { colors } from "../theme/colors";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Button } from "@chakra-ui/react";
import { MdOutlineRefresh } from "react-icons/md";
import ResourceTable from "../components/Table/ResourceTable";
import AddResource from "../components/Drawers/Resources/AddResource";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

interface Resource {
  _id: string;
  name: string;
  type: string;
  specification?: string;
  createdAt: string;
  updatedAt: string;
}

const Resources = () => {

  const [cookies] = useCookies();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isAddResourceDrawerOpened, setIsAddResourceDrawerOpened] =
    useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const openAddResourceDrawerHandler = () => {
    setEditResource(null); // Clear edit state when opening add drawer
    setIsAddResourceDrawerOpened(true);
  };

  const closeAddResourceDrawerHandler = () => {
    setIsAddResourceDrawerOpened(false);
    setEditResource(null); // Always clear edit state when closing drawer
  };

  const fetchResourcesHandler = async () => {
    try {
      setIsLoadingResources(true);
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}resources`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      console.log(res?.data);
      setResources(res?.data?.resources || []);
      setFilteredResources(res?.data?.resources || []);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoadingResources(false);
    }
  };

  const deleteResourceHandler = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}resources/${id}`,
        {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const updatedResources = resources.filter(
        (resource) => resource._id !== id
      );
      setResources(updatedResources);
      setFilteredResources(updatedResources);

      toast.success("Resource deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete resource");
    }
  };

  const handleResourceCreated = (newResource: Resource) => {
    const updatedResources = [newResource, ...resources];
    setResources(updatedResources);
    setFilteredResources(updatedResources);
  };
  

  const bulkDeleteResourcesHandler = async (ids: string[]) => {
    try {
      const deletePromises = ids.map((id) =>
        axios.delete(`${process.env.REACT_APP_BACKEND_URL}resources/${id}`, {
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      const updatedResources = resources.filter(
        (resource) => !ids.includes(resource._id)
      );
      setResources(updatedResources);
      setFilteredResources(updatedResources);

      toast.success(
        `${ids.length} resource${
          ids.length > 1 ? "s" : ""
        } deleted successfully`
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete some resources");
    }
  };
  
  

  const handleSearch = (value: string) => {
    setSearchKey(value);
    if (!value) {
      setFilteredResources(resources);
    } else {
      const filtered = resources.filter(
        (resource) =>
          resource.name.toLowerCase().includes(value.toLowerCase()) ||
          resource.type.toLowerCase().includes(value.toLowerCase()) ||
          (resource.specification &&
            resource.specification.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredResources(filtered);
    }
  };

  const handleResourceUpdated = (updatedResource: Resource) => {
    const updatedResources = resources.map((resource) =>
      resource._id === updatedResource._id ? updatedResource : resource
    );
    setResources(updatedResources);
    setFilteredResources(updatedResources);
  };
  

  useEffect(() => {
    fetchResourcesHandler();
  }, []);

  useEffect(() => {
    handleSearch(searchKey);
  }, [searchKey, resources]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 lg:p-3">
      {isAddResourceDrawerOpened && (
        <AddResource
          onResourceCreated={handleResourceCreated}
          closeDrawerHandler={closeAddResourceDrawerHandler}
          editResource={editResource}
          onResourceUpdated={handleResourceUpdated}
          fetchResourcesHandler={fetchResourcesHandler}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Resource Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage resources and approvals efficiently
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={openAddResourceDrawerHandler}
              style={{
                backgroundColor: colors.primary[600],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
              className="flex items-center gap-2 px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <FiPlus size={16} />
              Add New Resource
            </button>
            <Button
              onClick={fetchResourcesHandler}
              leftIcon={<MdOutlineRefresh />}
              variant="outline"
              colorScheme="gray"
              size="md"
              className="border-gray-300 hover:border-gray-400 transition-all duration-200"
              _hover={{ bg: "gray.50", transform: "translateY(-1px)" }}
              isLoading={isLoadingResources}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mt-4 flex justify-center sm:justify-end">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              placeholder="Search resources..."
              value={searchKey || ""}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ResourceTable
          resources={filteredResources}
          isLoadingResources={isLoadingResources}
          deleteResourceHandler={deleteResourceHandler}
          fetchResourcesHandler={fetchResourcesHandler}
          setEditResource={setEditResource}
          editResource={editResource}
          openUpdateResourceDrawerHandler={openAddResourceDrawerHandler}
          setAddResourceDrawerOpened={setIsAddResourceDrawerOpened}
          bulkDeleteResourcesHandler={bulkDeleteResourcesHandler}
        />
      </div>
    </div>
  );
};

export default Resources;
