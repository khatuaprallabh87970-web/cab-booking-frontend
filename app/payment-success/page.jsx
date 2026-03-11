"use client";

import { useEffect } from "react";
import axios from "axios";

export default function PaymentSuccess() {

  useEffect(() => {
    const rideId = localStorage.getItem("lastRide");

    if (rideId) {
      axios.put(`https://cab-booking-backend-rcg3.onrender.com/api/rides/pay/${rideId}`);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-green-600">
          Payment Successful 🎉
        </h1>
        <p>Your ride payment is completed.</p>
      </div>
    </div>
  );
}