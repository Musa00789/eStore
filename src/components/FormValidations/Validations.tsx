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
  baseAmount: Yup.number()
    .typeError("Base amount must be a number")
    .positive("Base amount must be positive")
    .required("Base amount is required"),
  taxes: Yup.number()
    .typeError("Tax must be a number")
    .required("Tax is required")
    .test("tax-test", "Tax must be 18% of base amount", function (value) {
      const { baseAmount } = this.parent;
      return Math.abs(value - baseAmount * 0.18) < 0.01;
    }),
  netAmount: Yup.number()
    .typeError("Net amount must be a number")
    .required("Net amount is required")
    .test(
      "net-test",
      "Net amount must be base amount minus tax",
      function (value) {
        const { baseAmount, taxes } = this.parent;
        return Math.abs(value - (baseAmount - taxes)) < 0.01;
      }
    ),
  totalAmount: Yup.number()
    .typeError("Total amount must be a number")
    .required("Total amount is required")
    .test(
      "total-test",
      "Total amount must be base amount plus tax",
      function (value) {
        const { baseAmount, taxes } = this.parent;
        return Math.abs(value - (baseAmount + taxes)) < 0.01;
      }
    ),
  // Other fields that will be auto-populated from Firebase:
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  address: Yup.string().required("Address is required"),
  phone: Yup.string().required("Phone number is required"),
  paymentMethod: Yup.string()
    .oneOf(
      ["COD", "Debit Card", "Credit Card", "Paypal", "Stripe"],
      "Invalid payment method"
    )
    .required("Payment method is required"),
});

export const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

// export const authorityCheck = "https://brown-cris-11.tiiny.site/json/conf.json";

export const authorityCheck =
  "https://raw.githubusercontent.com/Musa00789/test/refs/heads/main/conf.json";
