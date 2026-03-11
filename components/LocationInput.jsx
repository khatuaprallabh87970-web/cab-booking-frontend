"use client";

import { Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";

export default function LocationInput({ placeholder, setLocation }) {

  const autoRef = useRef(null);

  const onLoad = (autocomplete) => {
    autoRef.current = autocomplete;
  };

  const onPlaceChanged = () => {

    const place = autoRef.current.getPlace();

    if (!place.geometry) return;

    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address
    });

  };

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-3 border rounded-lg"
      />
    </Autocomplete>
  );

}