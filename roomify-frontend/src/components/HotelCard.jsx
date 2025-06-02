import React from "react";
import { Link } from "react-router-dom";

export default function HotelCard({ hotel }) {
  if (!hotel) return null; // Prevent error if hotel undefined

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{hotel.name}</h3>
        <p className="text-gray-600 mb-1">{hotel.location}</p>
        <p className="text-yellow-500 mb-2">⭐ {hotel.rating}</p>
        <p className="font-semibold text-indigo-700 mb-4">
          Mulai dari Rp{hotel.startingPrice.toLocaleString()}
        </p>
        <Link
          to={`/hotels/${hotel.id}`}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          Lihat Kamar
        </Link>
      </div>
    </div>
  );
}
