const { object, string } = require('yup');

exports.PartiesValidation = object({
    full_name: string()
        .required("Full name is a required field")
        .min(2, "Full name must be at least 2 characters long")
        .max(100, "Full name must be at most 100 characters long"),
    email: string()
        .email("Must be a valid email")
        .required("Email is a required field"),

    phone: string()
        .matches(/^\+?[1-9]\d{1,14}$/, "Must be a valid phone number")
        .required("Phone number is a required field"),

    // type: string()
    //     .oneOf(['admin', 'user', 'guest'], "Type must be one of: admin, user, guest")
    //     .required("Type is a required field"),
    type: string().required("Type is a required field"),
});
