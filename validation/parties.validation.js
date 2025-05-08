const {string,object} = require("yup");


export const PartiesValidation = object({
    email:string().email().required("Email is Required field"),
    phone:string().email().required("Email is Required field"),
    type:string().email().required("Email is Required field"),
})


