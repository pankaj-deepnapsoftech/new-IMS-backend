import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { parseCookies } from "nookies";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Auth"],

  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "auth/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    loginWithToken: builder.query({
      query: () => "auth/login",
    }),
    register: builder.mutation({
      query: (data) => ({
        url: "auth/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyUser: builder.mutation({
      query: (data) => ({
        url: "auth/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    forgetPassword: builder.mutation({
      query: (data) => ({
        url: "auth/reset-password-request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "auth/reset-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    resendOTP: builder.mutation({
      query: (data) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "product",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Product"],

  endpoints: (builder) => ({
    fetchProducts: builder.query({
      query: () => "/all",
      providesTags: ["Product"],
    }),
    addProduct: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: "Product", _id }],
    }),
    deleteProduct: builder.mutation<void, { _id: string }>({
      query: (data) => ({
        url: "/",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    bulkDeleteProducts: builder.mutation({
      query: (productIds: string[]) => ({
        url: "/bulk-delete",
        method: "DELETE",
        body: { productIds },
      }),
      invalidatesTags: ["Product"],
    }),
    productDetails: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    unapprovedProducts: builder.query({
      query: (id) => `unapproved`,
    }),
    productBulKUpload: builder.mutation({
      query: (data) => ({
        url: "/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    productBulkUploadIndirect: builder.mutation({
      query: (data) => ({
        url: "/bulkindrect",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

const storeApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "store",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Store"],

  endpoints: (builder) => ({
    fetchStores: builder.query({
      query: () => "/all",
      providesTags: ["Store"],
    }),
    addStore: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Store"],
    }),
    updateStore: builder.mutation({
      query: (data) => ({
        url: `/${data?._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: "Store", _id }],
    }),
    deleteStores: builder.mutation({
      query: (_id) => ({
        url: `${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Store"],
    }),
    storeDetails: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Store", id }],
    }),
    unapprovedStores: builder.query({
      query: (id) => `unapproved`,
    }),
    storeBulKUpload: builder.mutation({
      query: (data) => ({
        url: "/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Store"],
    }),
  }),
});

const agentApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "agent",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Agent"],

  endpoints: (builder) => ({
    fetchBuyers: builder.query({
      query: () => "/buyers",
      providesTags: ["Agent"],
    }),
    fetchSellers: builder.query({
      query: () => "/suppliers",
      providesTags: ["Agent"],
    }),
    addAgent: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Agent"],
    }),
    updateAgent: builder.mutation({
      query: (data) => ({
        url: `/${data?._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: "Agent", _id }],
    }),
    deleteAgent: builder.mutation({
      query: (_id) => ({
        url: `${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agent"],
    }),
    agentDetails: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Agent", id }],
    }),
    unapprovedBuyers: builder.query({
      query: (id) => `unapproved/buyers`,
    }),
    unapprovedSellers: builder.query({
      query: (id) => `unapproved/suppliers`,
    }),
    agentBulKUpload: builder.mutation({
      query: (data) => ({
        url: "/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Agent"],
    }),
  }),
});

const bomApi = createApi({
  reducerPath: "bomApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "bom",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["BOM"],

  endpoints: (builder) => ({
    fetchBoms: builder.query({
      query: () => "/all",
      providesTags: ["BOM"],
    }),
    addBom: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BOM"],
    }),
    updateBOM: builder.mutation({
      query: (data) => ({
        url: `/${data?._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["BOM"],
    }),
    deleteBom: builder.mutation({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
    }),
    bomDetails: builder.query({
      query: (_id) => `/${_id}`,
    }),
    unapprovedBoms: builder.query({
      query: (_id) => "/unapproved",
    }),
  }),
});

const userRoleApi = createApi({
  reducerPath: "userRoleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "role",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Role"],

  endpoints: (builder) => ({
    fetchRoles: builder.query({
      query: () => "/",
      providesTags: ["Role"],
    }),
    addRole: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),
    deleteRole: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),
    roleDetails: builder.query({
      query: (_id) => `/${_id}`,
    }),
  }),
});

const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "auth",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Employee"],

  endpoints: (builder) => ({
    fetchEmployees: builder.query({
      query: () => "/all",
      providesTags: ["Employee"],
    }),
    updateEmployee: builder.mutation({
      query: (data) => ({
        url: "/user",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Employee"],
    }),
    employeeDetails: builder.query({
      query: (data) => "/user",
    }),
  }),
});

const proformaInvoiceApi = createApi({
  reducerPath: "proformaInvoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "proforma-invoice",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Proforma Invoice"],

  endpoints: (builder) => ({
    fetchProformaInvoices: builder.query({
      query: () => "/all",
      providesTags: ["Proforma Invoice"],
    }),
    proformaInvoiceDetails: builder.query({
      query: (_id) => `/${_id}`,
      providesTags: ["Proforma Invoice"],
    }),
    createProformaInvoice: builder.mutation({
      query: (data) => ({
        url: `/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Proforma Invoice"],
    }),
    updateProformaInvoice: builder.mutation({
      query: (data) => ({
        url: `/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Proforma Invoice"],
    }),
    deleteProformaInvoice: builder.mutation({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Proforma Invoice"],
    }),
  }),
});

const invoiceApi = createApi({
  reducerPath: "invoiceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "invoice",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Invoice"],

  endpoints: (builder) => ({
    fetchInvoices: builder.query({
      query: () => "/all",
      providesTags: ["Invoice"],
    }),
    invoiceDetails: builder.query({
      query: (_id) => `/${_id}`,
      providesTags: ["Invoice"],
    }),
    createInvoice: builder.mutation({
      query: (data) => ({
        url: `/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    updateInvoice: builder.mutation({
      query: (data) => ({
        url: `/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    deleteInvoice: builder.mutation({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoice"],
    }),
  }),
});

const processApi = createApi({
  reducerPath: "processApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "production-process",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Process"],

  endpoints: (builder) => ({
    fetchProcess: builder.query({
      query: () => "/all",
      providesTags: ["Process"],
    }),
    processDetails: builder.query({
      query: (_id) => `/${_id}`,
      providesTags: ["Process"],
    }),
    createProcess: builder.mutation({
      query: (data) => ({
        url: `/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Process"],
    }),
    updateProcess: builder.mutation({
      query: (data) => ({
        url: `/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Process"],
    }),
    deleteProcess: builder.mutation({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Process"],
    }),
  }),
});

const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACKEND_URL + "payment",
    mode: "cors",
    prepareHeaders: (headers) => {
      const cookies = parseCookies();
      const token = cookies?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Payment"],

  endpoints: (builder) => ({
    fetchPayment: builder.query({
      query: () => "/all",
      providesTags: ["Payment"],
    }),
    paymentDetails: builder.query({
      query: (_id) => `/${_id}`,
      providesTags: ["Payment"],
    }),
    createPayment: builder.mutation({
      query: (data) => ({
        url: `/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    updatePayment: builder.mutation({
      query: (data) => ({
        url: `/${data._id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    deletePayment: builder.mutation({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

// export default api;
export {
  api,
  productApi,
  storeApi,
  agentApi,
  bomApi,
  userRoleApi,
  employeeApi,
  proformaInvoiceApi,
  invoiceApi,
  processApi,
  paymentApi,
};

// Authentication APIs
export const {
  useLoginMutation,
  useLazyLoginWithTokenQuery,
  useRegisterMutation,
  useVerifyUserMutation,
  useResendOTPMutation,
  useResetPasswordMutation,
  useForgetPasswordMutation,
} = api;

// Product APIs
export const {
  useLazyFetchProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useBulkDeleteProductsMutation,
  useLazyProductDetailsQuery,
  useLazyUnapprovedProductsQuery,
  useProductBulKUploadMutation,
  useProductBulkUploadIndirectMutation,
} = productApi;

// Store APIs
export const {
  useLazyFetchStoresQuery,
  useAddStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoresMutation,
  useLazyStoreDetailsQuery,
  useLazyUnapprovedStoresQuery,
  useStoreBulKUploadMutation,
} = storeApi;

// Agent APIs
export const {
  useLazyFetchBuyersQuery,
  useLazyFetchSellersQuery,
  useAddAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useLazyAgentDetailsQuery,
  useLazyUnapprovedBuyersQuery,
  useLazyUnapprovedSellersQuery,
  useAgentBulKUploadMutation,
} = agentApi;

// BOM APIs
export const {
  useLazyFetchBomsQuery,
  useAddBomMutation,
  useUpdateBOMMutation,
  useDeleteBomMutation,
  useLazyBomDetailsQuery,
  useLazyUnapprovedBomsQuery,
} = bomApi;

// Use Role APIs
export const {
  useLazyFetchRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useLazyRoleDetailsQuery,
} = userRoleApi;

// Employee APIs
export const {
  useLazyEmployeeDetailsQuery,
  useLazyFetchEmployeesQuery,
  useUpdateEmployeeMutation,
} = employeeApi;

// Proforma Invoice APIs
export const {
  useLazyFetchProformaInvoicesQuery,
  useLazyProformaInvoiceDetailsQuery,
  useCreateProformaInvoiceMutation,
  useUpdateProformaInvoiceMutation,
  useDeleteProformaInvoiceMutation,
} = proformaInvoiceApi;

// Invoice APIs
export const {
  useLazyFetchInvoicesQuery,
  useLazyInvoiceDetailsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoiceApi;

// Process APIs
export const {
  useLazyFetchProcessQuery,
  useLazyProcessDetailsQuery,
  useCreateProcessMutation,
  useUpdateProcessMutation,
  useDeleteProcessMutation,
} = processApi;

// Payment APIs
export const {
  useLazyFetchPaymentQuery,
  useLazyPaymentDetailsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
} = paymentApi;
