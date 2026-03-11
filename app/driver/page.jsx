"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DriverDashboard() {
  const router = useRouter();
  const [rides, setRides] = useState([]);

  const driverId = "bc36eab5-4292-49d3-b71d-0f147b3f1e0a";

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "driver") router.push("/login");
  }, []);

  // 🔵 Send driver live location
  const sendLocation = (rideId) => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          await axios.put(
            `http://localhost:5000/api/rides/location/${rideId}`,
            { lat, lng }
          );
        } catch (error) {
          console.error("Location update failed:", error);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  // Fetch pending rides
  const fetchRides = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/rides/pending"
    );
    setRides(res.data);
  };

  // Fetch rides assigned to this driver
  const fetchDriverRide = async () => {
  const res = await axios.get(
    `http://localhost:5000/api/rides/driver/${driverId}`
  );

  setRides((prev) => {
    const all = [...prev, ...res.data];

    const unique = [];
    const ids = new Set();

    for (const ride of all) {
      if (!ids.has(ride.id)) {
        ids.add(ride.id);
        unique.push(ride);
      }
    }

    return unique;
  });
};

  // Accept ride
  const acceptRide = async (rideId) => {
    console.log("Ride ID:", rideId);

    await axios.put(
      `http://localhost:5000/api/rides/accept/${rideId}`,
      { driverId }
    );

    fetchRides();
    fetchDriverRide();
  };

  // Start ride
  const startRide = async (rideId) => {
    await axios.put(
      `http://localhost:5000/api/rides/start/${rideId}`
    );

    // 🟢 Start sending GPS location
    sendLocation(rideId);

    fetchRides();
    fetchDriverRide();
  };

  // Complete ride
  const completeRide = async (rideId) => {
    await axios.put(
      `http://localhost:5000/api/rides/complete/${rideId}`
    );
    fetchRides();
    fetchDriverRide();
  };

  useEffect(() => {
    fetchRides();
    fetchDriverRide();

    const interval = setInterval(() => {
      fetchRides();
      fetchDriverRide();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-4">

        {/* Logout */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <h1 className="text-3xl font-bold text-black text-center">
          Driver Dashboard
        </h1>

        {rides.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-600">
            No rides available
          </div>
        )}

        {rides.map((ride) => (
          <div
            key={ride.id}
            className="bg-white rounded-2xl shadow-lg p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-black">
                {ride.pickup_location} → {ride.dropoff_location}
              </span>

              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  ride.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : ride.status === "ongoing"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {ride.status}
              </span>
            </div>

            <div className="flex gap-2">
              {ride.status === "pending" && (
                <button
                  onClick={() => acceptRide(ride.id)}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Accept Ride
                </button>
              )}

              {ride.status === "accepted" && (
                <button
                  onClick={() => startRide(ride.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Start Ride
                </button>
              )}

              {ride.status === "ongoing" && (
                <button
                  onClick={() => completeRide(ride.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Complete Ride
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}