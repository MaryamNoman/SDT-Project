"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Trash2,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  LogOut,
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

export default function AccountantDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceItemType, setInvoiceItemType] = useState("");
  const [invoiceItemRoomType, setInvoiceItemRoomType] = useState("");
  const [invoiceItemService, setInvoiceItemService] = useState("");

  const roomTypes = [
    { value: "deluxe", label: "Deluxe", rent: 200 },
    { value: "studio", label: "Studio", rent: 150 },
    { value: "standard", label: "Standard", rent: 100 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, customersRes, servicesRes] = await Promise.all([
        axios.get("http://localhost:3001/invoices"),
        axios.get("http://localhost:3001/customers"),
        axios.get("http://localhost:3001/services"),
      ]);
      setInvoices(invoicesRes.data);
      setCustomers(customersRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedInvoices = React.useMemo(() => {
    let sortableInvoices = [...invoices];
    if (sortConfig.key !== null) {
      sortableInvoices.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, sortConfig]);

  const generateId = () => {
    return `INV${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleAddNewInvoice = () => {
    const newInvoice = {
      invoiceID: "",
      customerID: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      status: "Unpaid",
      items: [],
    };
    setCurrentInvoice(newInvoice);
    setInvoiceItems([]);
    setIsModalOpen(true);
    setEditMode(true);
    setViewMode(false);
    setFormErrors({});
  };

  const handleGenerateInvoice = (invoice) => {
    setCurrentInvoice({ ...invoice, items: invoice.items || [] });
    setInvoiceItems(invoice.items || []);
    setIsModalOpen(true);
    setEditMode(false);
    setViewMode(false);
    setFormErrors({});
  };

  const handleViewInvoice = (invoice) => {
    setCurrentInvoice({ ...invoice, items: invoice.items || [] });
    setInvoiceItems(invoice.items || []);
    setIsModalOpen(true);
    setEditMode(false);
    setViewMode(true);
  };

  const handleEditInvoice = (invoice) => {
    setCurrentInvoice({ ...invoice, items: invoice.items || [] });
    setInvoiceItems(invoice.items || []);
    setIsModalOpen(true);
    setEditMode(true);
    setViewMode(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!currentInvoice.customerID) {
      errors.customerID = "Customer is required";
    }
    if (!currentInvoice.date) {
      errors.date = "Date is required";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const invoiceDate = new Date(currentInvoice.date);
      invoiceDate.setHours(0, 0, 0, 0); // Normalize the time components

      if (invoiceDate > today) {
        errors.date = "Future dates are not allowed";
      }
    }
    if (invoiceItems.length === 0) {
      errors.items = "At least one item is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addInvoiceItem = () => {
    if (invoiceItemType === "room" && invoiceItemRoomType) {
      const selectedType = roomTypes.find(
        (type) => type.value === invoiceItemRoomType
      );
      if (selectedType) {
        setInvoiceItems([
          ...invoiceItems,
          {
            type: "room",
            name: selectedType.label,
            price: selectedType.rent,
          },
        ]);
        setInvoiceItemRoomType("");
      }
    } else if (invoiceItemType === "service" && invoiceItemService) {
      const selectedService = services.find(
        (s) => s.name === invoiceItemService
      );
      if (selectedService) {
        setInvoiceItems([
          ...invoiceItems,
          {
            type: "service",
            name: selectedService.name,
            price: selectedService.price,
          },
        ]);
        setInvoiceItemService("");
      }
    }
  };

  const removeInvoiceItem = (index) => {
    const newItems = [...invoiceItems];
    newItems.splice(index, 1);
    setInvoiceItems(newItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + item.price, 0);
  };


  const handleSaveInvoice = async () => {
    if (!validateForm()) return;

    try {
      const total = calculateTotal();
      const updatedInvoice = {
        ...currentInvoice,
        invoiceID: currentInvoice.invoiceID || generateId("INV", invoices),
        amount: total,
        date: currentInvoice.date,
        items: [...invoiceItems],
      };

      // Remove the _id field if it exists to avoid conflicts
      const { _id, ...invoiceData } = updatedInvoice;

      const endpoint = currentInvoice._id
        ? `http://localhost:3001/invoices/${currentInvoice._id}`
        : "http://localhost:3001/invoices";

      const method = currentInvoice._id ? "put" : "post";

      const response = await axios[method](endpoint, invoiceData);

      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(
        `Failed to save invoice: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentInvoice({ ...currentInvoice, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );
  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  ).length;
  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;
  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.status === "Unpaid"
  ).length;

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr
            className={`text-left ${
              isDarkMode
                ? "bg-gray-800 text-gray-100"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {[
              { key: "invoiceID", label: "Invoice ID" },
              { key: "customerID", label: "Customer ID" },
              { key: "amount", label: "Amount" },
              { key: "date", label: "Date" },
              { key: "status", label: "Status" },
            ].map((column, index) => (
              <th
                key={index}
                className="p-3 text-sm font-semibold tracking-wide cursor-pointer"
                onClick={() => handleSort(column.key)}
              >
                {column.label}{" "}
                {sortConfig.key === column.key &&
                  (sortConfig.direction === "ascending" ? (
                    <ChevronDown className="inline w-4 h-4" />
                  ) : (
                    <ChevronDown className="inline w-4 h-4 rotate-180" />
                  ))}
              </th>
            ))}
            <th className="p-3 text-sm font-semibold tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center">
                Loading invoices...
              </td>
            </tr>
          ) : sortedInvoices.length > 0 ? (
            sortedInvoices.map((invoice) => (
              <motion.tr
                key={invoice.invoiceID}
                className={`border-b ${
                  isDarkMode
                    ? "border-gray-700 hover:bg-gray-800"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td
                  className={`p-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {invoice.invoiceID}
                </td>
                <td
                  className={`p-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {invoice.customerID}
                </td>
                <td
                  className={`p-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  $
                  {invoice.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={`p-3 text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {invoice.date
                    ? new Date(invoice.date).toLocaleDateString()
                    : ""}
                </td>
                <td className="p-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      invoice.status === "Pending"
                        ? isDarkMode
                          ? "bg-yellow-500/20 text-yellow-200"
                          : "bg-yellow-100 text-yellow-800"
                        : invoice.status === "Paid"
                        ? isDarkMode
                          ? "bg-green-500/20 text-green-200"
                          : "bg-green-100 text-green-800"
                        : isDarkMode
                        ? "bg-red-500/20 text-red-200"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => handleViewInvoice(invoice)}
                      className={`p-1 rounded ${
                        isDarkMode
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleEditInvoice(invoice)}
                      className={`p-1 rounded ${
                        isDarkMode
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-yellow-600 hover:text-yellow-800"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center">
                No invoices found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100"
      } transition-all duration-500 ease-in-out relative`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/images/hotel.PNG"
                alt="Hotel Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              CosmicStay
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>
            <motion.button
              onClick={() => (window.location.href = "/Screen/login")}
              className={`p-2 rounded-full transition-colors flex items-center space-x-1 ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </motion.button>
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src="/images/Accountant.PNG"
                    alt="Accountant Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ACCOUNTANT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Total Revenue Card */}
            <motion.div
              className={`p-6 rounded-lg shadow-lg ${
                isDarkMode
                  ? "bg-opacity-20 bg-purple-900 backdrop-blur-sm border border-purple-500/20"
                  : "bg-white bg-opacity-90"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  Total Revenue
                </h2>
                <DollarSign
                  className={`w-8 h-8 ${
                    isDarkMode ? "text-purple-300" : "text-purple-500"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                $
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </motion.div>

            {/* Pending Invoices Card */}
            <motion.div
              className={`p-6 rounded-lg shadow-lg ${
                isDarkMode
                  ? "bg-opacity-20 bg-purple-900 backdrop-blur-sm border border-purple-500/20"
                  : "bg-white bg-opacity-90"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  Pending Invoices
                </h2>
                <Clock
                  className={`w-8 h-8 ${
                    isDarkMode ? "text-purple-300" : "text-purple-500"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {pendingInvoices}
              </p>
            </motion.div>

            {/* Paid Invoices Card */}
            <motion.div
              className={`p-6 rounded-lg shadow-lg ${
                isDarkMode
                  ? "bg-opacity-20 bg-purple-900 backdrop-blur-sm border border-purple-500/20"
                  : "bg-white bg-opacity-90"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  Paid Invoices
                </h2>
                <CheckCircle
                  className={`w-8 h-8 ${
                    isDarkMode ? "text-purple-300" : "text-purple-500"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {paidInvoices}
              </p>
            </motion.div>

            {/* Unpaid Invoices Card */}
            <motion.div
              className={`p-6 rounded-lg shadow-lg ${
                isDarkMode
                  ? "bg-opacity-20 bg-purple-900 backdrop-blur-sm border border-purple-500/20"
                  : "bg-white bg-opacity-90"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  Unpaid Invoices
                </h2>
                <AlertCircle
                  className={`w-8 h-8 ${
                    isDarkMode ? "text-purple-300" : "text-purple-500"
                  }`}
                />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {unpaidInvoices}
              </p>
            </motion.div>
          </motion.div>

          {/* Invoice Management Section */}
          <motion.div
            className={`rounded-lg shadow-lg overflow-hidden ${
              isDarkMode
                ? "bg-opacity-20 bg-purple-900 backdrop-blur-sm border border-purple-500/20"
                : "bg-white bg-opacity-90"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className={`p-6 flex justify-between items-center border-b ${
                isDarkMode ? "border-purple-500/20" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-2xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Invoice Management
              </h2>
              <motion.button
                onClick={handleAddNewInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Invoice</span>
              </motion.button>
            </div>

            {renderTable()}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-lg shadow-lg p-6 ${
                isDarkMode
                  ? "bg-purple-900/90 backdrop-blur-sm border border-purple-500/20"
                  : "bg-white"
              }`}
              style={{ maxHeight: "90vh", overflowY: "auto" }} // Add this line
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {viewMode
                    ? "View Invoice"
                    : currentInvoice?.invoiceID
                    ? "Edit Invoice"
                    : "Add Invoice"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-1 rounded-full ${
                    isDarkMode ? "hover:bg-purple-800" : "hover:bg-gray-100"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 space-y-2">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Invoice ID:
                  </label>
                  <input
                    type="text"
                    name="invoiceID"
                    value={currentInvoice?.invoiceID || ""}
                    placeholder="Will be auto-generated"
                    readOnly
                    className={`mt-1 block w-full rounded-md ${
                      isDarkMode
                        ? "bg-purple-800 border-purple-600 text-gray-400"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    } shadow-sm p-2`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Customer:
                  </label>
                  <select
                    name="customerID"
                    value={currentInvoice?.customerID || ""}
                    onChange={handleInputChange}
                    disabled={viewMode}
                    className={`mt-1 block w-full rounded-md ${
                      isDarkMode
                        ? "bg-purple-800 border-purple-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 ${
                      viewMode ? "appearance-none" : ""
                    }`}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option
                        key={customer.customerID}
                        value={customer.customerID}
                      >
                        {customer.name} ({customer.customerID})
                      </option>
                    ))}
                  </select>
                  {formErrors.customerID && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.customerID}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Date:
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={
                      currentInvoice?.date
                        ? currentInvoice.date.split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    disabled={viewMode}
                    max={new Date().toISOString().split("T")[0]} // This is already present
                    className={`mt-1 block w-full rounded-md ${
                      isDarkMode
                        ? "bg-purple-800 border-purple-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-500">
                      {formErrors.date}
                    </p>
                  )}
                </div>
                {!viewMode && (
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Status:
                    </label>
                    <select
                      name="status"
                      value={currentInvoice?.status || "Unpaid"}
                      onChange={handleInputChange}
                      disabled={viewMode}
                      className={`mt-1 block w-full rounded-md ${
                        isDarkMode
                          ? "bg-purple-800 border-purple-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                )}
              </div>

              {!viewMode && (
                <div className="mb-4">
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Add Items
                  </h3>
                  <div className="flex space-x-2">
                    <select
                      value={invoiceItemType}
                      onChange={(e) => setInvoiceItemType(e.target.value)}
                      className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        isDarkMode
                          ? "bg-purple-800 border-purple-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="">Select Type</option>
                      <option value="room">Room</option>
                      <option value="service">Service</option>
                    </select>
                    {invoiceItemType === "room" && (
                      <select
                        value={invoiceItemRoomType}
                        onChange={(e) => setInvoiceItemRoomType(e.target.value)}
                        className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                          isDarkMode
                            ? "bg-purple-800 border-purple-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="">Select Room Type</option>
                        {roomTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label} (${type.rent})
                          </option>
                        ))}
                      </select>
                    )}
                    {invoiceItemType === "service" && (
                      <select
                        value={invoiceItemService}
                        onChange={(e) => setInvoiceItemService(e.target.value)}
                        className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                          isDarkMode
                            ? "bg-purple-800 border-purple-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="">Select Service</option>
                        {services.map((service) => (
                          <option key={service._id} value={service.name}>
                            {service.name} (${service.price})
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={addInvoiceItem}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={
                        !invoiceItemType ||
                        (invoiceItemType === "room" && !invoiceItemRoomType) ||
                        (invoiceItemType === "service" && !invoiceItemService)
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Invoice Items
                </h3>
                {formErrors.items && (
                  <p className="text-sm text-red-500 mb-2">
                    {formErrors.items}
                  </p>
                )}
                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-2">
                    {invoiceItems.length > 0 ? (
                      invoiceItems.map((item, index) => (
                        <motion.li
                          key={index}
                          className={`flex justify-between items-center p-2 rounded ${
                            isDarkMode ? "bg-purple-800" : "bg-gray-100"
                          }`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span
                            className={
                              isDarkMode ? "text-gray-200" : "text-gray-800"
                            }
                          >
                            {item.type === "room"
                              ? `${item.name} Room`
                              : item.name}{" "}
                            - ${item.price.toFixed(2)}
                          </span>
                          {!viewMode && (
                            <motion.button
                              onClick={() => removeInvoiceItem(index)}
                              className="text-red-500 hover:text-red-700"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          )}
                        </motion.li>
                      ))
                    ) : (
                      <li
                        className={`p-2 text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No items added
                      </li>
                    )}
                  </ul>
                </div>
                <p
                  className={`font-bold mt-2 text-right ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Total: $
                  {calculateTotal().toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
                {!viewMode && (
                  <motion.button
                    onClick={handleSaveInvoice}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Invoice
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
