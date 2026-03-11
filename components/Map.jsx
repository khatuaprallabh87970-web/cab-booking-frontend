"use client";

import {
  GoogleMap,
  Marker,
  DirectionsRenderer
} from "@react-google-maps/api";

import { useState, useEffect } from "react";

const containerStyle = {
  width: "100%",
  height: "300px",
};

export default function MapComponent({ pickup, drop }) {

  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const [routePath, setRoutePath] = useState([]);
  const [driverIndex, setDriverIndex] = useState(0);

  const [driverPosition, setDriverPosition] = useState(null);

  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);


  const getCoordinates = (location) => {

    return new Promise((resolve, reject) => {

      if (typeof location === "object" && location?.lat) {
        resolve(location);
        return;
      }

      if (typeof location !== "string") {
        reject("Invalid location");
        return;
      }

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: location }, (results, status) => {

        if (status === "OK") {

          const loc = results[0].geometry.location;

          resolve({
            lat: loc.lat(),
            lng: loc.lng()
          });

        } else {
          reject(status);
        }

      });

    });

  };


  const handleLoad = async () => {

    if (!pickup || !drop) return;

    try {

      const pickupLocation = await getCoordinates(pickup);
      const dropLocation = await getCoordinates(drop);

      setPickupCoords(pickupLocation);
      setDropCoords(dropLocation);

      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: pickupLocation,
          destination: dropLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {

          if (status === "OK") {

            setDirections(result);

            const leg = result.routes[0].legs[0];

            setDistance(leg.distance.text);
            setDuration(leg.duration.text);

            const path = result.routes[0].overview_path.map(p => ({
              lat: p.lat(),
              lng: p.lng()
            }));

            setRoutePath(path);
            setDriverPosition(path[0]);

          }

        }
      );

    } catch (err) {
      console.log("Geocode error", err);
    }

  };


  // 🚗 Driver movement
  useEffect(() => {

    if (routePath.length === 0) return;

    const interval = setInterval(() => {

      setDriverIndex(prev => {

        const next = prev + 1;

        if (next < routePath.length) {
          setDriverPosition(routePath[next]);
          return next;
        }

        return prev;

      });

    }, 400); //

    return () => clearInterval(interval);

  }, [routePath]);


  const calculateFare = () => {

    if (!distance) return 0;

    const km = parseFloat(distance);

    return 50 + Math.round(km * 12);

  };


  return (

    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverPosition || pickupCoords || { lat: 20.2961, lng: 86.6085 }}
        zoom={12}
        onLoad={handleLoad}
      >

        {pickupCoords && <Marker position={pickupCoords} />}

        {dropCoords && <Marker position={dropCoords} />}

        {/* 🚗 Driver Marker */}
        {driverPosition && (
          <Marker
            position={driverPosition}
            icon={{
              url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        )}

        {directions && <DirectionsRenderer directions={directions} />}

      </GoogleMap>


      {distance && (
        <div className="mt-3 text-sm space-y-1">

          <p><b>Distance:</b> {distance}</p>

          <p><b>Estimated Time:</b> {duration}</p>

          <p><b>Estimated Fare:</b> ₹{calculateFare()}</p>

          {/* 🚗 Arrival message */}
          <p className="text-green-600 font-semibold">
            🚗 Driver arriving in {duration}
          </p>

        </div>
      )}

    </>

  );

}