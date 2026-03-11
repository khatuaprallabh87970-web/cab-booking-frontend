"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function RideHistory() {
  const [rides, setRides] = useState([]);

  const fetchHistory = async () => {
    const res = await axios.get("https://cab-booking-backend-rcg3.onrender.com/api/rides/all");
    setRides(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-white flex justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold text-center text-black">Ride History</h1>

        {rides.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            No rides found
          </div>
        )}

        {rides.map((ride) => (
          <div
            key={ride.id}
            className="bg-white p-5 rounded-xl shadow space-y-2 text-gray-800"
          >
            <p>
              <b>Pickup:</b> {ride.pickup_location}
            </p>

            <p>
              <b>Drop:</b> {ride.dropoff_location}
            </p>

            <p>
  <b>Status:</b>{" "}
  <span
    className={
      ride.status === "completed"
        ? "text-green-600 font-semibold"
        : ride.status === "accepted"
        ? "text-blue-600 font-semibold"
        : "text-yellow-600 font-semibold"
    }
  >
    {ride.status}
  </span>
</p>

            {ride.driver_name && (
              <p>
                <b>Driver:</b> {ride.driver_name}
              </p>
            )}

            <p>
              <b>Fare:</b> ₹{ride.fare}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}