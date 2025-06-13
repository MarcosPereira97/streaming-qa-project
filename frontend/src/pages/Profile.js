import * as yup from "yup";

import React, { useState } from "react";
import { changePassword, updateProfile } from "../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const profileSchema = yup.object({
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9]+$/,
      "Username must contain only letters and numbers"
    ),
  fullName: yup
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must not exceed 255 characters"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain uppercase, lowercase, number and special character"
    )
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onProfileSubmit = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully");
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await dispatch(
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    );
    if (changePassword.fulfilled.match(result)) {
      resetPasswordForm();
      setShowPasswordFields(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8" data-test="profile-title">
          Account Settings
        </h1>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-dark-800">
          {["profile", "security", "preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              data-test={`tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-6 bg-dark-900 rounded-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-2"
                  >
                    Username
                  </label>
                  <input
                    {...registerProfile("username")}
                    type="text"
                    id="username"
                    className={`input ${
                      profileErrors.username ? "input-error" : ""
                    }`}
                    data-test="username-input"
                  />
                  {profileErrors.username && (
                    <p className="mt-1 text-sm text-red-500">
                      {profileErrors.username.message}
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    {...registerProfile("fullName")}
                    type="text"
                    id="fullName"
                    className={`input ${
                      profileErrors.fullName ? "input-error" : ""
                    }`}
                    data-test="fullname-input"
                  />
                  {profileErrors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {profileErrors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    {...registerProfile("email")}
                    type="email"
                    id="email"
                    className={`input ${
                      profileErrors.email ? "input-error" : ""
                    }`}
                    data-test="email-input"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {profileErrors.email.message}
                    </p>
                  )}
                  {user?.emailVerified === false && (
                    <p className="mt-1 text-sm text-yellow-500">
                      Email not verified. Check your inbox for verification
                      link.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !isProfileDirty}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  data-test="save-profile-button"
                >
                  {isLoading ? <LoadingSpinner size="small" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Change Password */}
            <div className="bg-dark-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>

              {!showPasswordFields ? (
                <button
                  onClick={() => setShowPasswordFields(true)}
                  className="btn-secondary"
                  data-test="change-password-button"
                >
                  Change Password
                </button>
              ) : (
                <form
                  onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium mb-2"
                    >
                      Current Password
                    </label>
                    <input
                      {...registerPassword("currentPassword")}
                      type="password"
                      id="currentPassword"
                      className={`input ${
                        passwordErrors.currentPassword ? "input-error" : ""
                      }`}
                      data-test="current-password-input"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium mb-2"
                    >
                      New Password
                    </label>
                    <input
                      {...registerPassword("newPassword")}
                      type="password"
                      id="newPassword"
                      className={`input ${
                        passwordErrors.newPassword ? "input-error" : ""
                      }`}
                      data-test="new-password-input"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      {...registerPassword("confirmPassword")}
                      type="password"
                      id="confirmPassword"
                      className={`input ${
                        passwordErrors.confirmPassword ? "input-error" : ""
                      }`}
                      data-test="confirm-password-input"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordFields(false);
                        resetPasswordForm();
                      }}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                      data-test="update-password-button"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-dark-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Two-Factor Authentication
              </h2>
              <p className="text-gray-400 mb-4">
                Add an extra layer of security to your account by enabling
                two-factor authentication.
              </p>
              <button className="btn-secondary" disabled>
                Coming Soon
              </button>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-dark-900 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-400">
                    Receive updates about new content
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Autoplay Next Episode</h3>
                  <p className="text-sm text-gray-400">
                    Automatically play the next episode
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Show Previews</h3>
                  <p className="text-sm text-gray-400">
                    Show video previews on hover
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
