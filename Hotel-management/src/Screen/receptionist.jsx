"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BedDouble,
  ClipboardList,
  Users,
  LogOut,
  Plus,
  Search,
  Mail,
  Bell,
  Edit,
  Trash2,
  ChevronDown,
  Moon,
  Sun,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import axios from "axios";
import { dummyData } from "../dummyData";
import { countries } from "../utils/countries";

export default function ReceptionistDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceItemType, setInvoiceItemType] = useState("");
  const [invoiceItemRoomType, setInvoiceItemRoomType] = useState("");
  const [invoiceItemService, setInvoiceItemService] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [errors, setErrors] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);

  // Refs
  const bellAudioRef = useRef(null);

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
      const selectedService = [...serviceOptions, ...services].find(
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

  const handleCountrySearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const filtered = countries.filter(
        (country) =>
          country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          country.phoneCode.includes(countrySearch)
      );
      if (filtered.length > 0) {
        handleCountrySelect(filtered[0]);
      }
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearch("");

    const currentNumber = editingItem
      ? editingItem.contactInfo
      : newItem.contactInfo || "";

    const localNumber = currentNumber.includes("-")
      ? currentNumber.split("-").slice(1).join("")
      : currentNumber.replace(/[^\d]/g, "");

    const newNumber = `+${country.phoneCode}-${localNumber}`;

    if (editingItem) {
      setEditingItem({ ...editingItem, contactInfo: newNumber });
    } else {
      setNewItem({ ...newItem, contactInfo: newNumber });
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (activeTab === "users") {
      if (!editingItem && (!newItem.name || newItem.name.length < 4)) {
        newErrors.name = "Name must be at least 4 characters";
      }
      if (editingItem && !editingItem.name) {
        newErrors.name = "Name is required";
      }
      if (
        !editingItem &&
        (!newItem.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newItem.email))
      ) {
        newErrors.email = "Valid email is required";
      }
      if (editingItem && !editingItem.email) {
        newErrors.email = "Email is required";
      }
      if (
        !editingItem &&
        (!newItem.password ||
          newItem.password.length < 8 ||
          newItem.password.length > 10)
      ) {
        newErrors.password = "Password must be 8-10 characters";
      }
      if (
        editingItem &&
        editingItem.password &&
        (editingItem.password.length < 8 || editingItem.password.length > 10)
      ) {
        newErrors.password = "Password must be 8-10 characters";
      }
      if (!editingItem && newItem.password !== newItem.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!editingItem && !newItem.role) {
        newErrors.role = "Role is required";
      }
      if (editingItem && !editingItem.role) {
        newErrors.role = "Role is required";
      }
    } else if (activeTab === "rooms") {
      if (!editingItem && !newItem.roomNo) {
        newErrors.roomNo = "Room number is required";
      }
      if (editingItem && !editingItem.roomNo) {
        newErrors.roomNo = "Room number is required";
      }
      if (!editingItem && !newItem.hotelID) {
        newErrors.hotelID = "Hotel ID is required";
      }
      if (editingItem && !editingItem.hotelID) {
        newErrors.hotelID = "Hotel ID is required";
      }
      if (!editingItem && !newItem.roomCategory) {
        newErrors.roomCategory = "Room type is required";
      }
      if (editingItem && !editingItem.roomCategory) {
        newErrors.roomCategory = "Room type is required";
      }
      if (!editingItem && !newItem.status) {
        newErrors.status = "Status is required";
      }
      if (editingItem && !editingItem.status) {
        newErrors.status = "Status is required";
      }
    } else if (activeTab === "customers") {
      if (!editingItem && !newItem.name) {
        newErrors.name = "Name is required";
      } else if (!editingItem && newItem.name && newItem.name.length > 15) {
        newErrors.name = "Name must be 15 characters or less";
      }
      if (editingItem && !editingItem.name) {
        newErrors.name = "Name is required";
      } else if (
        editingItem &&
        editingItem.name &&
        editingItem.name.length > 15
      ) {
        newErrors.name = "Name must be 15 characters or less";
      }

      // Contact Info validation
      const contactInfo = editingItem
        ? editingItem.contactInfo
        : newItem.contactInfo || "";
      if (!contactInfo) {
        newErrors.contactInfo = "Contact info is required";
      } else if (!/^\+\d{1,4}-\d{4,15}$/.test(contactInfo)) {
        newErrors.contactInfo =
          "Format: +[country code]-[4-15 digit local number]";
      }

      // Nationality validation (for both new and editing)
      const nationality = editingItem
        ? editingItem.nationality
        : newItem.nationality || "";
      if (!nationality) {
        newErrors.nationality = "Nationality is required";
      } else if (nationality.length > 15) {
        newErrors.nationality = "Nationality must be 15 characters or less";
      }

      // Gender validation (for both new and editing)
      const gender = editingItem ? editingItem.gender : newItem.gender || "";
      if (!gender) {
        newErrors.gender = "Gender is required";
      } else if (!["Male", "Female", "Other"].includes(gender)) {
        newErrors.gender = "Please select a valid gender";
      }
    } else if (activeTab === "reservations") {
      // Customer validation (applies to both new and editing)
      if (!editingItem && !newItem.customerID) {
        newErrors.customerID = "Customer is required";
      }
      if (editingItem && !editingItem.customerID) {
        newErrors.customerID = "Customer is required";
      }

      // Room No validation (applies to both new and editing)
      if (!editingItem && !newItem.roomNo) {
        newErrors.roomNo = "Room is required";
      }
      if (editingItem && !editingItem.roomNo) {
        newErrors.roomNo = "Room is required";
      }

      // Check In validation (applies to both new and editing)
      if (!editingItem && !newItem.checkIn) {
        newErrors.checkIn = "Check-in date is required";
      }
      if (editingItem && !editingItem.checkIn) {
        newErrors.checkIn = "Check-in date is required";
      }

      // Check Out validation (applies to both new and editing)
      if (!editingItem && !newItem.checkOut) {
        newErrors.checkOut = "Check-out date is required";
      }
      if (editingItem && !editingItem.checkOut) {
        newErrors.checkOut = "Check-out date is required";
      }

      // Additional validation for check-out being after check-in
      if (
        (editingItem || newItem.checkIn) &&
        (editingItem || newItem.checkOut)
      ) {
        const checkIn = editingItem ? editingItem.checkIn : newItem.checkIn;
        const checkOut = editingItem ? editingItem.checkOut : newItem.checkOut;

        if (new Date(checkOut) <= new Date(checkIn)) {
          newErrors.checkOut = "Check-out must be after check-in";
        }
      }
    } else if (activeTab === "invoices") {
      if (!editingItem && !newItem.customerID) {
        newErrors.customerID = "Customer is required";
      }
      if (!editingItem && invoiceItems.length === 0) {
        newErrors.items = "At least one item is required";
      }
      if (editingItem && !editingItem.customerID) {
        newErrors.customerID = "Customer is required";
      }
      if (editingItem && !editingItem.amount) {
        newErrors.amount = "Amount is required";
      }
      if (editingItem && !editingItem.date) {
        newErrors.date = "Date is required";
      }
      if (editingItem && !editingItem.status) {
        newErrors.status = "Status is required";
      }
    } else if (activeTab === "services") {
      if (!editingItem && (!newItem.name || newItem.name.trim().length < 2)) {
        newErrors.name = "Service name must be at least 2 characters";
      }
      if (editingItem && !editingItem.name) {
        newErrors.name = "Service name is required";
      }
      if (!editingItem && (!newItem.price || newItem.price <= 0)) {
        newErrors.price = "Price must be greater than 0";
      }
      if (editingItem && (!editingItem.price || editingItem.price <= 0)) {
        newErrors.price = "Price must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Constants for dropdown options
  const roomTypes = [
    { value: "deluxe", label: "Deluxe", rent: 200 },
    { value: "studio", label: "Studio", rent: 150 },
    { value: "standard", label: "Standard", rent: 100 },
  ];

  const serviceOptions = [
    { name: "Room Service", price: 20 },
    { name: "Laundry", price: 15 },
    { name: "Spa", price: 50 },
  ];

  // Utility functions for dashboard metrics
  const calculateMonthlyChanges = (currentCount, previousCount) => {
    if (previousCount === 0) return currentCount === 0 ? 0 : 100;
    return Math.round(((currentCount - previousCount) / previousCount) * 100);
  };

  const getCurrentAndPreviousMonthCounts = (items, dateField = "createdAt") => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthItems = items.filter((item) => {
      const itemDate = new Date(item[dateField] || now);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });

    let previousMonthItems = [];
    switch (activeTab) {
      case "customers":
        previousMonthItems = dummyData.customers;
        break;
      case "rooms":
        previousMonthItems = dummyData.rooms;
        break;
      case "invoices":
        previousMonthItems = dummyData.invoices;
        break;
      case "reservations":
        previousMonthItems = dummyData.reservations;
        break;
      default:
        previousMonthItems = [];
    }

    return {
      current: currentMonthItems.length,
      previous: previousMonthItems.length,
    };
  };

  const generateId = (prefix, items) => {
    const existingIds = items.map((item) => item[`${prefix.toLowerCase()}ID`]);
    let newIdNum = 1;
    while (
      existingIds.includes(`${prefix}${newIdNum.toString().padStart(3, "0")}`)
    ) {
      newIdNum++;
    }
    return `${prefix}${newIdNum.toString().padStart(3, "0")}`;
  };

  // Play bell sound
  useEffect(() => {
    if (isBellRinging && bellAudioRef.current) {
      bellAudioRef.current.play();
    }
  }, [isBellRinging]);

  // Dark mode toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Menu items
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", value: "dashboard" },
    { icon: BedDouble, label: "Rooms", value: "rooms" },
    { icon: ClipboardList, label: "Services", value: "services" },
    { icon: Users, label: "Customers", value: "customers" },
    { icon: LayoutDashboard, label: "Reservations", value: "reservations" },
    { icon: ClipboardList, label: "Invoices", value: "invoices" },
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/${activeTab}`);
      if (response.data && Array.isArray(response.data)) {
        switch (activeTab) {
          case "rooms":
            setRooms(response.data);
            break;
          case "customers":
            setCustomers(response.data);
            break;
          case "reservations":
            setReservations(response.data);
            break;
          case "services":
            setServices(response.data);
            break;
          case "invoices":
            setInvoices(response.data);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Handle adding new item
  const handleAddItem = async () => {
    // Prevent adding services for receptionist
    if (activeTab === "services") {
      setIsModalOpen(false);
      return;
    }

    if (!validateFields()) return;

    try {
      let itemToSend = { ...newItem };

      if (activeTab === "reservations" || activeTab === "invoices") {
        if (!itemToSend.customerID && customers.length > 0) {
          itemToSend.customerID = customers[0].customerID;
        } else if (!itemToSend.customerID) {
          throw new Error("Please add customers first");
        }
      }

      switch (activeTab) {
        case "rooms":
          itemToSend = {
            ...itemToSend,
            roomNo: itemToSend.roomNo?.startsWith("RM")
              ? itemToSend.roomNo
              : `RM${itemToSend.roomNo?.padStart(3, "0")}`,
            hotelID: itemToSend.hotelID?.startsWith("HT")
              ? itemToSend.hotelID
              : `HT${itemToSend.hotelID?.padStart(3, "0")}`,
          };
          break;

        case "reservations":
          itemToSend = {
            ...itemToSend,
            roomNo: itemToSend.roomNo?.startsWith("RM")
              ? itemToSend.roomNo
              : `RM${itemToSend.roomNo?.padStart(3, "0")}`,
            checkIn: itemToSend.checkIn
              ? new Date(itemToSend.checkIn).toISOString()
              : new Date().toISOString(),
            checkOut: itemToSend.checkOut
              ? new Date(itemToSend.checkOut).toISOString()
              : new Date(Date.now() + 86400000).toISOString(),
          };
          break;

        case "invoices":
          itemToSend = {
            ...itemToSend,
            items: invoiceItems,
            amount: invoiceItems.reduce((sum, item) => sum + item.price, 0),
            date: itemToSend.date
              ? new Date(itemToSend.date).toISOString()
              : new Date().toISOString(),
            status: itemToSend.status || "Unpaid",
          };
          break;

        default:
          break;
      }

      const response = await axios.post(
        `http://localhost:3001/${activeTab}`,
        itemToSend
      );

      switch (activeTab) {
        case "rooms":
          setRooms([...rooms, response.data]);
          break;
        case "customers":
          setCustomers([...customers, response.data]);
          setIsBellRinging(true);
          break;
        case "reservations":
          setReservations([...reservations, response.data]);
          setShowReservationPopup(true);
          break;
        case "invoices":
          setInvoices([...invoices, response.data]);
          break;
        default:
          break;
      }

      setNewItem({});
      setInvoiceItems([]);
      setInvoiceItemType("");
      setInvoiceItemRoomType("");
      setInvoiceItemService("");
      setIsModalOpen(false);
      setErrors({});
    } catch (error) {
      console.error("Error adding item:", error);
      alert(
        `Failed to add ${activeTab.slice(0, -1)}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Reset bell ringing
  useEffect(() => {
    if (isBellRinging) {
      const timer = setTimeout(() => {
        setIsBellRinging(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isBellRinging]);

  // Reset popup
  useEffect(() => {
    if (showReservationPopup) {
      const timer = setTimeout(() => {
        setShowReservationPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showReservationPopup]);

  // Handle updating item
  const handleUpdateItem = async () => {
    // Only allow updates for reservations, customers, and invoices
    if (
      activeTab !== "reservations" &&
      activeTab !== "customers" &&
      activeTab !== "invoices"
    ) {
      setIsModalOpen(false);
      return;
    }

    if (!validateFields()) return;

    try {
      let updatedItem = { ...editingItem };

      // Format data based on active tab
      switch (activeTab) {
        case "customers":
          // Format customer data if needed
          updatedItem = {
            ...updatedItem,
            contactInfo: updatedItem.contactInfo || "",
            nationality: updatedItem.nationality || "",
            gender: updatedItem.gender || "",
          };
          break;

        case "reservations":
          // Format reservation data
          updatedItem = {
            ...updatedItem,
            roomNo: updatedItem.roomNo?.startsWith("RM")
              ? updatedItem.roomNo
              : `RM${updatedItem.roomNo?.padStart(3, "0")}`,
            checkIn: updatedItem.checkIn
              ? new Date(updatedItem.checkIn).toISOString()
              : new Date().toISOString(),
            checkOut: updatedItem.checkOut
              ? new Date(updatedItem.checkOut).toISOString()
              : new Date(Date.now() + 86400000).toISOString(),
          };
          break;

        case "invoices":
          updatedItem = {
            ...updatedItem,
            items: updatedItem.items || [],
            amount:
              updatedItem.items?.reduce((sum, item) => sum + item.price, 0) ||
              0,
            status: updatedItem.status || "Unpaid",
          };
          break;

        default:
          break;
      }

      // Update local state first for a responsive UI
      switch (activeTab) {
        case "customers":
          setCustomers(
            customers.map((customer) =>
              customer.customerID === updatedItem.customerID
                ? updatedItem
                : customer
            )
          );
          break;
        case "reservations":
          setReservations(
            reservations.map((reservation) =>
              reservation.reservationID === updatedItem.reservationID
                ? updatedItem
                : reservation
            )
          );
          break;
        case "invoices":
          setInvoices(
            invoices.map((invoice) =>
              invoice.invoiceID === updatedItem.invoiceID
                ? updatedItem
                : invoice
            )
          );
          break;
        default:
          break;
      }

      // Send update to server
      await axios.put(
        `http://localhost:3001/${activeTab}/${updatedItem._id}`,
        updatedItem
      );

      // Refresh data from server to ensure consistency
      await fetchData();

      // Reset form state
      setEditingItem(null);
      setIsModalOpen(false);
      setErrors({});
    } catch (error) {
      console.error("Error updating item:", error);
      // Revert local changes if update fails
      await fetchData();
      alert(
        `Failed to update ${activeTab.slice(0, -1)}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handle deleting item - Disabled for receptionist
  const handleDeleteItem = async (item) => {
    // No delete permissions for receptionist
    return;
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    let sortableItems = [
      ...(activeTab === "rooms"
        ? rooms
        : activeTab === "customers"
        ? customers
        : activeTab === "reservations"
        ? reservations
        : activeTab === "services"
        ? services
        : activeTab === "invoices"
        ? invoices
        : []),
    ];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [
    rooms,
    customers,
    reservations,
    services,
    invoices,
    activeTab,
    sortConfig,
  ]);

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  const renderActions = (item) => {
    // No actions for rooms and services
    if (activeTab === "rooms" || activeTab === "services") return null;

    // Edit for reservations, customers, and invoices (no delete)
    if (
      activeTab === "reservations" ||
      activeTab === "customers" ||
      activeTab === "invoices"
    ) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              // For invoices, handle the items array properly
              if (activeTab === "invoices") {
                setEditingItem({
                  ...item,
                  items: Array.isArray(item.items) ? item.items : [],
                });
                setInvoiceItems(Array.isArray(item.items) ? item.items : []);
              } else {
                setEditingItem(item);
              }
              setIsModalOpen(true);
            }}
            className="p-1 text-blue-400 hover:text-blue-300"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      );
    }

    // No actions for other tabs
    return null;
  };

  const renderTable = (data, columns) => (
    <div>
      {/* Only show "Add New" button for tabs where adding is allowed */}
      {activeTab !== "services" && (
        <div className="mb-4">
          <button
            onClick={() => {
              setEditingItem(null);
              setNewItem({});
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Add New
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-gray-200"
              } text-left`}
            >
              {columns.map((column, index) => (
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
              {/* Show Actions header for customers, reservations, and invoices */}
              {(activeTab === "customers" ||
                activeTab === "reservations" ||
                activeTab === "invoices") && (
                <th className="p-3 text-sm font-semibold tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`${
                  isDarkMode
                    ? "border-b border-gray-700"
                    : "border-b border-gray-300"
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-3 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : column.key === "price" || column.key === "amount"
                      ? `$${Number(item[column.key]).toFixed(2)}`
                      : item[column.key]}
                  </td>
                ))}
                {/* Show Actions column for customers, reservations, and invoices */}
                {(activeTab === "customers" ||
                  activeTab === "reservations" ||
                  activeTab === "invoices") && (
                  <td className="p-3 text-sm">{renderActions(item)}</td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render form fields based on active tab
  const renderFormFields = () => {
    switch (activeTab) {
      case "rooms":
        return (
          <>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Room No (5 digits)
              </label>
              <input
                type="text"
                placeholder="e.g., 001"
                value={
                  editingItem
                    ? editingItem.roomNo?.replace("RM", "")
                    : newItem.roomNo || ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                  editingItem
                    ? setEditingItem({ ...editingItem, roomNo: value })
                    : setNewItem({ ...newItem, roomNo: value });
                }}
                readOnly={!!editingItem}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                }`}
              />
              {errors.roomNo && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.roomNo}
                </small>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Hotel ID (5 digits)
              </label>
              <input
                type="text"
                placeholder="e.g., 001"
                value={
                  editingItem
                    ? editingItem.hotelID?.replace("HT", "")
                    : newItem.hotelID || ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                  editingItem
                    ? setEditingItem({ ...editingItem, hotelID: value })
                    : setNewItem({ ...newItem, hotelID: value });
                }}
                readOnly={!!editingItem}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                }`}
              />
              {errors.hotelID && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.hotelID}
                </small>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Type
              </label>
              <select
                value={
                  editingItem
                    ? editingItem.roomCategory
                    : newItem.roomCategory || ""
                }
                onChange={(e) => {
                  const selectedType = roomTypes.find(
                    (type) => type.value === e.target.value
                  );
                  const updatedItem = {
                    ...(editingItem ? editingItem : newItem),
                    roomCategory: e.target.value,
                    rent: selectedType ? selectedType.rent : "",
                  };
                  editingItem
                    ? setEditingItem(updatedItem)
                    : setNewItem(updatedItem);
                }}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                } ${errors.roomCategory ? "border-red-500" : ""}`}
              >
                <option value="">Select Type</option>
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} (${type.rent})
                  </option>
                ))}
              </select>
              {errors.roomCategory && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.roomCategory}
                </small>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Rent
              </label>
              <input
                type="number"
                placeholder="Rent"
                value={editingItem ? editingItem.rent : newItem.rent || ""}
                readOnly
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Status
              </label>
              <select
                value={editingItem ? editingItem.status : newItem.status || ""}
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({ ...editingItem, status: e.target.value })
                    : setNewItem({ ...newItem, status: e.target.value })
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                } ${errors.status ? "border-red-500" : ""}`}
              >
                <option value="">Select Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              {errors.status && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.status}
                </small>
              )}
            </div>
          </>
        );
      case "customers":
        return (
          <>
            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Customer ID
              </label>
              <div
                className={`px-3 py-2 rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {editingItem
                  ? editingItem.customerID
                  : "Will be auto-generated"}
              </div>
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Enter customer name (max 15 letters)"
                value={editingItem ? editingItem.name : newItem.name || ""}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z ]/g, "")
                    .slice(0, 15);
                  editingItem
                    ? setEditingItem({ ...editingItem, name: value })
                    : setNewItem({ ...newItem, name: value });
                }}
                className={`mt-1 block w-full px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Contact Info
              </label>
              <div className="flex rounded-md shadow-sm">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className={`inline-flex items-center px-3 py-2 rounded-l-md border-r ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                  >
                    {selectedCountry ? (
                      <>
                        <span className="mr-2">{selectedCountry.emoji}</span>
                        <span>+{selectedCountry.phoneCode}</span>
                      </>
                    ) : (
                      "+"
                    )}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div
                      className={`absolute z-50 mt-1 w-64 max-h-60 overflow-auto rounded-md shadow-lg ${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      } border ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="p-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            onKeyDown={handleCountrySearchKeyDown}
                            className={`w-full pl-8 pr-3 py-2 rounded-md text-sm ${
                              isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-white text-gray-900"
                            }`}
                          />
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {countries
                          .filter(
                            (country) =>
                              country.name
                                .toLowerCase()
                                .includes(countrySearch.toLowerCase()) ||
                              country.phoneCode.includes(countrySearch)
                          )
                          .map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleCountrySelect(country)}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center hover:${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <span className="mr-2">{country.emoji}</span>
                              <span className="flex-1">{country.name}</span>
                              <span className="text-gray-500">
                                +{country.phoneCode}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  placeholder="Local number (4-15 digits)"
                  value={(editingItem
                    ? editingItem.contactInfo
                    : newItem.contactInfo || ""
                  )
                    .split("-")
                    .slice(1)
                    .join("")}
                  onChange={(e) => {
                    // Allow only digits and limit to 15 characters
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 15);

                    // Get current country code
                    const countryCode = selectedCountry
                      ? selectedCountry.phoneCode
                      : "92";

                    // Format as +[country code]-[local number]
                    const newContactInfo = `+${countryCode}-${digits}`;

                    if (editingItem) {
                      setEditingItem({
                        ...editingItem,
                        contactInfo: newContactInfo,
                      });
                    } else {
                      setNewItem({ ...newItem, contactInfo: newContactInfo });
                    }
                  }}
                  className={`flex-1 min-w-0 block px-3 py-2 rounded-r-md border-l-0 border ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactInfo}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Nationality
              </label>
              <input
                type="text"
                placeholder="Enter nationality (max 15 letters)"
                value={
                  editingItem
                    ? editingItem.nationality
                    : newItem.nationality || ""
                }
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z ]/g, "")
                    .slice(0, 15);
                  editingItem
                    ? setEditingItem({ ...editingItem, nationality: value })
                    : setNewItem({ ...newItem, nationality: value });
                }}
                className={`mt-1 block w-full px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
              {errors.nationality && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nationality}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Gender
              </label>
              <select
                value={editingItem ? editingItem.gender : newItem.gender || ""}
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({ ...editingItem, gender: e.target.value })
                    : setNewItem({ ...newItem, gender: e.target.value })
                }
                className={`mt-1 block w-full px-3 py-2 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </>
        );

      case "reservations":
        const availableRooms = rooms.filter(
          (room) => room.status === "Available"
        );

        return (
          <>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Reservation ID
              </label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={
                  editingItem
                    ? editingItem.reservationID
                    : "Will be auto-generated"
                }
                readOnly
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Customer
              </label>
              <select
                value={
                  editingItem
                    ? editingItem.customerID
                    : newItem.customerID || ""
                }
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({
                        ...editingItem,
                        customerID: e.target.value,
                      })
                    : setNewItem({ ...newItem, customerID: e.target.value })
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.customerID} value={customer.customerID}>
                    {customer.name} ({customer.customerID})
                  </option>
                ))}
              </select>
              {errors.customerID && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.customerID}
                </small>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Room
              </label>
              <select
                value={editingItem ? editingItem.roomNo : newItem.roomNo || ""}
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({ ...editingItem, roomNo: e.target.value })
                    : setNewItem({ ...newItem, roomNo: e.target.value })
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <option value="">Select Room</option>
                {availableRooms.map((room) => (
                  <option key={room.roomNo} value={room.roomNo}>
                    {room.roomNo} ({room.roomCategory})
                  </option>
                ))}
              </select>
              {errors.roomNo && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.roomNo}
                </small>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Check In
              </label>
              <input
                type="datetime-local"
                placeholder="Check In"
                min={new Date().toISOString().slice(0, 16)}
                value={
                  editingItem ? editingItem.checkIn : newItem.checkIn || ""
                }
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({
                        ...editingItem,
                        checkIn: e.target.value,
                      })
                    : setNewItem({ ...newItem, checkIn: e.target.value })
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                }`}
              />
              {errors.checkIn && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.checkIn}
                </small>
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Check Out
              </label>
              <input
                type="datetime-local"
                placeholder="Check Out"
                min={
                  editingItem
                    ? editingItem.checkIn
                    : newItem.checkIn
                    ? new Date(new Date(newItem.checkIn).getTime() + 3600000)
                        .toISOString()
                        .slice(0, 16)
                    : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
                }
                value={
                  editingItem ? editingItem.checkOut : newItem.checkOut || ""
                }
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({
                        ...editingItem,
                        checkOut: e.target.value,
                      })
                    : setNewItem({ ...newItem, checkOut: e.target.value })
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-900"
                }`}
              />
              {errors.checkOut && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.checkOut}
                </small>
              )}
            </div>
          </>
        );
      case "services":
        return (
          <>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Service ID
              </label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={
                  editingItem ? editingItem.serviceID : "Will be auto-generated"
                }
                readOnly
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Service Name (max 15 chars)
              </label>
              <input
                type="text"
                placeholder="Service Name"
                value={editingItem ? editingItem.name : newItem.name || ""}
                readOnly
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Price (max $999)
              </label>
              <input
                type="number"
                placeholder="Price"
                min="0"
                max="999"
                step="0.01"
                value={editingItem ? editingItem.price : newItem.price || ""}
                readOnly
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              />
            </div>
            {editingItem?.isDefault && (
              <div className="mt-2 text-sm text-yellow-600">
                Note: This is a default service. Only the price can be modified.
              </div>
            )}
          </>
        );
      case "invoices":
        return (
          <>
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Invoice ID
              </label>
              <input
                type="text"
                placeholder="Auto-generated"
                value={
                  editingItem ? editingItem.invoiceID : "Will be auto-generated"
                }
                readOnly
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Customer
              </label>
              {editingItem ? (
                <div
                  className={`mt-1 px-3 py-2 rounded-md ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {editingItem.customerID}
                </div>
              ) : (
                <select
                  value={newItem.customerID || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, customerID: e.target.value })
                  }
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
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
              )}
              {errors.customerID && (
                <small
                  className={`${isDarkMode ? "text-red-400" : "text-red-600"}`}
                >
                  {errors.customerID}
                </small>
              )}
            </div>

            {!editingItem ? (
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Add Items
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={invoiceItemType}
                      onChange={(e) => setInvoiceItemType(e.target.value)}
                      className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-900"
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
                            ? "bg-gray-700 text-white"
                            : "bg-white text-gray-900"
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
                            ? "bg-gray-700 text-white"
                            : "bg-white text-gray-900"
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

                {invoiceItems.length > 0 && (
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Items
                    </label>
                    <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                      {invoiceItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2"
                        >
                          <span>
                            {item.name} - ${item.price.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 font-semibold">
                      Total: $
                      {invoiceItems
                        .reduce((sum, item) => sum + item.price, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Status
                  </label>
                  <select
                    value={newItem.status || "Unpaid"}
                    onChange={(e) =>
                      setNewItem({ ...newItem, status: e.target.value })
                    }
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Items
                  </label>
                  <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                    {editingItem.items?.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded ${
                              item.type === "room"
                                ? isDarkMode
                                  ? "bg-blue-900 text-blue-200"
                                  : "bg-blue-100 text-blue-800"
                                : isDarkMode
                                ? "bg-purple-900 text-purple-200"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {item.type === "room" ? "Room" : "Service"}
                          </span>
                        </div>
                        <span className="font-semibold">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">
                      $
                      {editingItem.items
                        ?.reduce((sum, item) => sum + item.price, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-lg font-bold">
                      ${editingItem.amount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Status
                  </label>
                  <select
                    value={editingItem.status || "Unpaid"}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value })
                    }
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`flex h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
          : "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
      } transition-colors duration-300`}
    >
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-64 ${
          isDarkMode ? "bg-black bg-opacity-50" : "bg-white bg-opacity-75"
        } shadow-lg relative z-10`}
      >
        <div className="p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
              <img
                src="/images/hotel.PNG"
                alt="Hotel Logo"
                className="w-16 h-16 rounded-full object-contain"
              />
            </div>
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              CosmicStay
            </span>
          </motion.div>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <motion.button
              key={item.value}
              whileHover={{
                scale: 1.05,
                backgroundColor: isDarkMode
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(59, 130, 246, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.value)}
              className={`w-full flex items-center space-x-2 px-6 py-3 ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-700 hover:text-gray-900"
              } transition-colors ${
                activeTab === item.value
                  ? isDarkMode
                    ? "bg-blue-600 bg-opacity-25 text-white"
                    : "bg-blue-200 text-blue-800"
                  : ""
              } border-r-4 border-blue-400`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: isDarkMode
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(239, 68, 68, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/Screen/login")}
            className={`w-full flex items-center space-x-2 px-6 py-3 ${
              isDarkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-700 hover:text-gray-900"
            } transition-colors mt-auto`}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <header
          className={`${
            isDarkMode ? "bg-black bg-opacity-50" : "bg-white bg-opacity-75"
          } shadow-md`}
        >
          <div className="flex items-center justify-between px-8 py-5">
            <motion.h1
              key={activeTab}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text"
            >
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </motion.h1>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                } transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                } transition-colors`}
              >
                <Bell
                  className={`w-5 h-5 ${
                    isBellRinging ? "text-yellow-400 animate-ring" : ""
                  }`}
                />
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  } transition-colors`}
                >
                  <Mail className="w-5 h-5" />
                </motion.button>
                {showReservationPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-10 right-0 bg-blue-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg"
                  >
                    New Reservation Added!
                  </motion.div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center"
                >
                  <img
                    src="/images/Receptionist.PNG"
                    alt="Receptionist Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </motion.div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    RECEPTIONIST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      title: "Total Customers",
                      value: customers.length,
                      change: calculateMonthlyChanges(
                        customers.length,
                        dummyData.customers.length
                      ),
                    },
                    {
                      title: "Active Rooms",
                      value: rooms.filter((room) => room.status === "Occupied")
                        .length,
                      change: calculateMonthlyChanges(
                        rooms.filter((room) => room.status === "Occupied")
                          .length,
                        dummyData.rooms.filter(
                          (room) => room.status === "Occupied"
                        ).length
                      ),
                    },
                    // {
                    //   title: "Revenue",
                    //   value: `$${invoices.reduce(
                    //     (sum, invoice) => sum + invoice.amount,
                    //     0
                    //   )}`,
                    //   change: calculateMonthlyChanges(
                    //     invoices.reduce(
                    //       (sum, invoice) => sum + invoice.amount,
                    //       0
                    //     ),
                    //     dummyData.invoices.reduce(
                    //       (sum, invoice) => sum + invoice.amount,
                    //       0
                    //     )
                    //   ),
                    // },
                    {
                      title: "Revenue",
                      value: `$${invoices.reduce(
                        (sum, invoice) => sum + invoice.amount,
                        0
                      ).toFixed(2)}`, // Add .toFixed(2) here
                      change: calculateMonthlyChanges(
                        invoices.reduce(
                          (sum, invoice) => sum + invoice.amount,
                          0
                        ),
                        dummyData.invoices.reduce(
                          (sum, invoice) => sum + invoice.amount,
                          0
                        )
                      ),
                    },
                    {
                      title: "Bookings",
                      value: reservations.length,
                      change: calculateMonthlyChanges(
                        reservations.length,
                        dummyData.reservations.length
                      ),
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-6 rounded-lg shadow-lg ${
                        isDarkMode
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <h3
                        className={`text-lg font-semibold mb-2 ${
                          isDarkMode ? "text-blue-300" : "text-blue-600"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-3xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.value}
                      </p>
                      <div
                        className={`mt-4 text-sm flex items-center ${
                          item.change >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {item.change >= 0 ? (
                          <ArrowUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 mr-1" />
                        )}
                        <span>{Math.abs(item.change)}% from last month</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === "rooms" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    isDarkMode ? "bg-black bg-opacity-50" : "bg-white"
                  } rounded-lg shadow-lg p-6 mb-8 border border-blue-500 border-opacity-25`}
                >
                  <h2
                    className={`text-xl font-semibold mb-4 ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Manage Rooms
                  </h2>
                  {renderTable(sortedData, [
                    { key: "roomNo", label: "Room No" },
                    { key: "hotelID", label: "Hotel ID" },
                    { key: "roomCategory", label: "Type" },
                    { key: "rent", label: "Rent" },
                    { key: "status", label: "Status" },
                  ])}
                </motion.div>
              )}

              {activeTab === "customers" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    isDarkMode ? "bg-black bg-opacity-50" : "bg-white"
                  } rounded-lg shadow-lg p-6 mb-8 border border-blue-500 border-opacity-25`}
                >
                  <h2
                    className={`text-xl font-semibold mb-4 ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Manage Customers
                  </h2>
                  {renderTable(sortedData, [
                    { key: "customerID", label: "Customer ID" },
                    { key: "name", label: "Name" },
                    { key: "contactInfo", label: "Contact Info" },
                    { key: "nationality", label: "Nationality" },
                    { key: "gender", label: "Gender" },
                  ])}
                </motion.div>
              )}

              {activeTab === "reservations" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    isDarkMode ? "bg-black bg-opacity-50" : "bg-white"
                  } rounded-lg shadow-lg p-6 mb-8 border border-blue-500 border-opacity-25`}
                >
                  <h2
                    className={`text-xl font-semibold mb-4 ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Manage Reservations
                  </h2>
                  {renderTable(sortedData, [
                    { key: "reservationID", label: "Reservation ID" },
                    { key: "customerID", label: "Customer ID" },
                    { key: "roomNo", label: "Room No" },
                    { key: "checkIn", label: "Check In" },
                    { key: "checkOut", label: "Check Out" },
                  ])}
                </motion.div>
              )}

              {activeTab === "services" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    isDarkMode ? "bg-black bg-opacity-50" : "bg-white"
                  } rounded-lg shadow-lg p-6 mb-8 border border-blue-500 border-opacity-25`}
                >
                  <h2
                    className={`text-xl font-semibold mb-4 ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    View Services
                  </h2>
                  {renderTable(sortedData, [
                    { key: "serviceID", label: "Service ID" },
                    { key: "name", label: "Name" },
                    {
                      key: "price",
                      label: "Price",
                      render: (value) => `$${Number(value).toFixed(2)}`,
                    },
                  ])}
                </motion.div>
              )}

              {activeTab === "invoices" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    isDarkMode ? "bg-black bg-opacity-50" : "bg-white"
                  } rounded-lg shadow-lg p-6 mb-8 border border-blue-500 border-opacity-25`}
                >
                  <h2
                    className={`text-xl font-semibold mb-4 ${
                      isDarkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Manage Invoices
                  </h2>
                  {renderTable(sortedData, [
                    { key: "invoiceID", label: "Invoice ID" },
                    { key: "customerID", label: "Customer ID" },
                    { key: "amount", label: "Amount" },
                    { key: "date", label: "Date" },
                    { key: "status", label: "Status" },
                  ])}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } p-6 rounded-lg w-96 border border-blue-500 border-opacity-25`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-blue-300" : "text-blue-600"
                }`}
              >
                {editingItem
                  ? `Edit ${activeTab.slice(0, -1)}`
                  : `Add New ${activeTab.slice(0, -1)}`}
              </h2>
              <div className="space-y-4">{renderFormFields()}</div>
              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  } rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editingItem ? handleUpdateItem : handleAddItem}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingItem ? "Save Changes" : "Add"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star-like particles (only visible in dark mode) */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.5 + 0.25,
                animation: `twinkle ${Math.random() * 4 + 2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Audio element for bell ring sound */}
      <audio ref={bellAudioRef} src="/bell-ring.mp3" preload="auto" />

      <style jsx>{`
        @keyframes ring {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(15deg);
          }
          50% {
            transform: rotate(-15deg);
          }
          75% {
            transform: rotate(15deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-ring {
          animation: ring 0.5s ease-in-out;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.25;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}
