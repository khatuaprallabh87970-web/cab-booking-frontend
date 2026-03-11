"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";

import MapComponent from "../../components/Map";
import LocationInput from "@/components/LocationInput";

export default function BookRide() {

  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) router.push("/login");
  }, []);

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [ride, setRide] = useState(null);

  const fetchRideStatus = async () => {
    const res = await axios.get("http://localhost:5000/api/rides/all");
    if (res.data.length > 0) {
      setRide(res.data[0]);
    }
  };

  useEffect(() => {
    fetchRideStatus();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("rides-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
        },
        () => {
          fetchRideStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const requestRide = async () => {

    if (!pickup || !dropoff) return;

    await axios.post("http://localhost:5000/api/rides/create", {
      rider_id: localStorage.getItem("userId"),
      pickup_location: pickup.address,
      dropoff_location: dropoff.address,
      fare: 200,
    });

    setPickup(null);
    setDropoff(null);

    fetchRideStatus();
  };


  // 💳 STRIPE PAYMENT FUNCTION
  const payForRide = async () => {
    try {

      const res = await axios.post(
        "http://localhost:5000/api/rides/create-checkout-session",
        {
          rideId: ride.id,
          amount: ride.fare,
        }
      );

      // Redirect to Stripe Checkout
      window.location.href = res.data.url;

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed");
    }
  };


  return (

    <LoadScript
      googleMapsApiKey="AIzaSyCdH-vYn3_tdUROQ0zxeQQbp3nFb3Riwu4"
      libraries={["places"]}
    >

      <div className="min-h-screen flex items-center justify-center bg-gray-200">

        <div className="w-full max-w-md space-y-5">

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

          {/* Booking Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Book a Ride
            </h2>

            <LocationInput
              placeholder="Pickup location"
              setLocation={setPickup}
            />

            <LocationInput
              placeholder="Dropoff location"
              setLocation={setDropoff}
            />

            <button
              onClick={requestRide}
              className="w-full bg-black text-white rounded-lg p-3 font-semibold hover:bg-gray-900 transition"
            >
              Request Ride
            </button>

          </div>

          <button
            onClick={() => router.push("/history")}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            View Ride History
          </button>

          {/* Ride Status */}
          {ride && (

            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Ride Status
              </h3>

              {/* Pickup → Drop Map */}
              <MapComponent
                pickup={pickup}
                drop={dropoff}
              />

              {/* Driver Live Location */}
              {ride.driver_lat && ride.driver_lng && (
                <div className="mt-4">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "300px" }}
                    center={{
                      lat: ride.driver_lat,
                      lng: ride.driver_lng
                    }}
                    zoom={14}
                  >
                    <Marker
                      position={{
                        lat: ride.driver_lat,
                        lng: ride.driver_lng
                      }}
                    />
                  </GoogleMap>
                </div>
              )}

              <p className="text-gray-700 mt-3">
                <strong>Status:</strong> {ride.status}
              </p>

              <p className="text-gray-700">
                <strong>Pickup:</strong> {ride.pickup_location || "-"}
              </p>

              {ride.driver_name && (
                <div className="mt-3 text-sm space-y-1">
                  <p><b>Driver:</b> {ride.driver_name}</p>
                  <p><b>Car:</b> {ride.car_name}</p>
                  <p><b>Phone:</b> {ride.driver_phone}</p>
                </div>
              )}

              <p className="text-gray-700">
                <strong>Drop:</strong> {ride.dropoff_location || "-"}
              </p>

              {ride.driver_id && (
                <p className="text-green-600 font-semibold mt-2">
                  Driver Assigned 🚖
                </p>
              )}

              {/* ⭐ Rating */}
              {ride.status === "completed" && (
                <div className="mt-4">
                  <p className="font-semibold">Rate Driver:</p>

                  <div className="flex gap-2 mt-2">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        key={star}
                        className="text-2xl"
                        onClick={async () => {
                          await axios.put(
                            `http://localhost:5000/api/rides/rate/${ride.id}`,
                            { rating: star }
                          );
                          alert("Thanks for rating!");
                        }}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>

                  {/* 💳 PAYMENT BUTTON */}
                  <button
                    onClick={payForRide}
                    className="bg-purple-600 text-white px-4 py-2 rounded mt-4"
                  >
                    Pay ₹{ride.fare}
                  </button>

                </div>
              )}

            </div>

          )}

        </div>

      </div>

    </LoadScript>

  );

}