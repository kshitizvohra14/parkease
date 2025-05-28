import React, { useState, useEffect } from "react";
import api from "../api";
import { Toaster, toast } from "react-hot-toast";
import { CalendarIcon, LayersIcon, DashboardIcon } from "@radix-ui/react-icons";

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 w-full text-left rounded-lg transition-colors ${
      active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"
    }`}
  >
    <Icon />
    <span>{label}</span>
  </button>
);

const Dashboard = () => {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions] = useState([
    { id: 1, user: "John Doe", amount: "$5", date: "2025-04-19" },
  ]);
  const [activeTab, setActiveTab] = useState("slots");

  useEffect(() => {
    fetchSlots();
    fetchBookings();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get("/slots");
      setSlots(res.data);
    } catch (err) {
      toast.error("Failed to fetch slots");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      const formatted = res.data.map((b) => ({
        _id: b._id,
        slot: b.slot.label,
        user: b.user.name,
        time: b.time,
      }));
      setBookings(formatted);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    }
  };

  const toggleSlotStatus = async (id) => {
    try {
      const res = await api.put(`/slots/${id}/toggle`);
      setSlots((prev) => prev.map((slot) => (slot._id === id ? res.data : slot)));
      toast.success("Slot status updated");
    } catch (err) {
      toast.error("Failed to update slot status");
    }
  };

  const handleAddSlot = async () => {
    const label = prompt("Enter new slot label:");
    if (label) {
      try {
        const res = await api.post("/slots", { label });
        setSlots((prev) => [...prev, res.data]);
        toast.success("Slot added successfully");
      } catch (err) {
        toast.error("Error adding slot");
      }
    }
  };

  const handleAddBooking = async () => {
    const slotId = prompt("Enter slot ID:");
    const userId = prompt("Enter user ID:");
    const time = prompt("Enter time (e.g., 10:00 AM):");

    if (slotId && userId && time) {
      try {
        const res = await api.post("/bookings", { slotId, userId, time });
        const booking = res.data.booking;
        setBookings((prev) => [
          ...prev,
          {
            _id: booking._id,
            slot: booking.slot.label,
            user: booking.user.name,
            time: booking.time,
          },
        ]);
        toast.success("Booking created successfully");
      } catch (err) {
        toast.error("Error creating booking");
      }
    }
  };

  const handleSlotBooking = async (slotId, userId, time) => {
    try {
      const res = await api.post("/bookings", { slotId, userId, time });
      const booking = res.data.booking;

      setBookings((prev) => [
        ...prev,
        {
          _id: booking._id,
          slot: booking.slot.label,
          user: booking.user.name,
          time: booking.time,
        },
      ]);

      setSlots((prev) =>
        prev.map((slot) => (slot._id === slotId ? { ...slot, status: "booked" } : slot))
      );

      toast.success("Slot booked successfully!");
    } catch (err) {
      toast.error("Error booking slot");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-4">
        <h2 className="text-2xl font-bold mb-6">ParkEase</h2>
        <SidebarItem
          icon={LayersIcon}
          label="Slots"
          active={activeTab === "slots"}
          onClick={() => setActiveTab("slots")}
        />
        <SidebarItem
          icon={CalendarIcon}
          label="Bookings"
          active={activeTab === "bookings"}
          onClick={() => setActiveTab("bookings")}
        />
        <SidebarItem
          icon={DashboardIcon}
          label="Transactions"
          active={activeTab === "transactions"}
          onClick={() => setActiveTab("transactions")}
        />
        <SidebarItem
          icon={CalendarIcon}
          label="Slot Booking"
          active={activeTab === "slotBooking"}
          onClick={() => setActiveTab("slotBooking")}
        />
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <Toaster />
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

        {activeTab === "slots" && (
          <div>
            <button
              onClick={handleAddSlot}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Slot
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div key={slot._id} className="bg-white p-4 rounded shadow">
                  <p className="text-lg font-medium">{slot.label}</p>
                  <p className={`mb-2 ${slot.status === "available" ? "text-green-600" : "text-red-600"}`}>
                    {slot.status}
                  </p>
                  <button
                    onClick={() => toggleSlotStatus(slot._id)}
                    className="text-blue-600 hover:underline"
                  >
                    Mark as {slot.status === "available" ? "Booked" : "Available"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            <button
              onClick={handleAddBooking}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Booking
            </button>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white p-4 rounded shadow">
                  <p><strong>Slot:</strong> {booking.slot}</p>
                  <p><strong>User:</strong> {booking.user}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="space-y-4">
            {transactions.map((txn) => (
              <div key={txn.id} className="bg-white p-4 rounded shadow">
                <p><strong>User:</strong> {txn.user}</p>
                <p><strong>Amount:</strong> {txn.amount}</p>
                <p><strong>Date:</strong> {txn.date}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "slotBooking" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Book a Slot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {slots
                .filter((slot) => slot.status === "available")
                .map((slot) => (
                  <div
                    key={slot._id}
                    className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <h3 className="text-lg font-bold mb-1">{slot.label}</h3>
                    <p className="text-sm text-green-600 mb-3">Available</p>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      onClick={() => {
                        const userId = prompt("Enter User ID:");
                        const time = prompt("Enter booking time (e.g., 9:30 AM):");
                        if (userId && time) {
                          handleSlotBooking(slot._id, userId, time);
                        }
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;