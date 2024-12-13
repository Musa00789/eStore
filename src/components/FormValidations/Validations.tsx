import * as Yup from "yup";

export const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const SignUpValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string()
    .matches(/^\d+$/, "Phone number must be numeric")
    .min(11, "Phone number must be at least 11 digits")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  status: Yup.string().required("User type is required"),
});

export const CheckOutValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  address: Yup.string()
    .min(10, "Address must be at least 10 characters")
    .required("Address is required"),
  phone: Yup.string()
    .matches(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits")
    .required("Phone number is required"),
  totalAmount: Yup.number()
    .positive("Total amount must be positive")
    .required("Total amount is required"),
  taxes: Yup.number()
    .positive("Taxes must be positive")
    .required("Taxes are required"),
  amountPayable: Yup.number()
    .positive("Amount payable must be positive")
    .required("Amount payable is required"),
  paymentMethod: Yup.string()
    .oneOf(
      ["COD", "Debit Card", "Credit Card", "Paypal", "Stripe"],
      "Invalid payment method"
    )
    .required("Payment method is required"),
});
