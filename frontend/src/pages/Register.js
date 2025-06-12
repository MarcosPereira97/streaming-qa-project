import * as yup from "yup";

import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";
import { register as registerUser } from "../store/slices/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers")
    .required("Username is required"),
  fullName: yup
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must not exceed 255 characters"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain uppercase, lowercase, number and special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions"),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const { confirmPassword, terms, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary-500">StreamFlix</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-gray-400">
            Join StreamFlix to start watching
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-dark-900 rounded-lg p-8 space-y-6 shadow-xl"
          data-test="register-form"
        >
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              autoComplete="email"
              className={`input ${errors.email ? "input-error" : ""}`}
              placeholder="Enter your email"
              data-test="email-input"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500" data-test="email-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
            >
              Username
            </label>
            <input
              {...register("username")}
              type="text"
              id="username"
              autoComplete="username"
              className={`input ${errors.username ? "input-error" : ""}`}
              placeholder="Choose a username"
              data-test="username-input"
            />
            {errors.username && (
              <p
                className="mt-1 text-sm text-red-500"
                data-test="username-error"
              >
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium mb-2"
            >
              Full Name (Optional)
            </label>
            <input
              {...register("fullName")}
              type="text"
              id="fullName"
              autoComplete="name"
              className={`input ${errors.fullName ? "input-error" : ""}`}
              placeholder="Enter your full name"
              data-test="fullname-input"
            />
            {errors.fullName && (
              <p
                className="mt-1 text-sm text-red-500"
                data-test="fullname-error"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                className={`input pr-10 ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder="Create a strong password"
                data-test="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                data-test="toggle-password"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p
                className="mt-1 text-sm text-red-500"
                data-test="password-error"
              >
                {errors.password.message}
              </p>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Must contain: uppercase, lowercase, number, and special character
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                className={`input pr-10 ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
                placeholder="Confirm your password"
                data-test="confirm-password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                data-test="toggle-confirm-password"
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                className="mt-1 text-sm text-red-500"
                data-test="confirm-password-error"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div>
            <div className="flex items-start">
              <input
                {...register("terms")}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-700 rounded bg-dark-800 mt-1"
                data-test="terms-checkbox"
              />
              <label htmlFor="terms" className="ml-2 block text-sm">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-500" data-test="terms-error">
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center"
            data-test="register-button"
          >
            {isLoading ? <LoadingSpinner size="small" /> : "Create Account"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-900 text-gray-400">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-medium"
              data-test="login-link"
            >
              Sign in instead
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
