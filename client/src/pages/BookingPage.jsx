import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddressLink from "../AddressLink";
import BookingDates from "../BookingDates";
import PlaceGallery from "../PlaceGallery";

function BookingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  useEffect(() => {
    axios.get("/bookings").then((response) => {
      const foundBooking = response.data.find(
        ({ booking_id }) => booking_id === id
      );
      if (foundBooking) {
        setBooking(foundBooking);
      }
    });
  }, [id]);
  if (!booking) {
    return "";
  }
  return (
    <div className="my-8">
      <h1 className="text-3xl">{booking.title}</h1>
      <AddressLink className="my-2 block">{booking.address}</AddressLink>
      <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-4">Your booking information:</h2>
          <BookingDates booking={booking} />
        </div>
        <div className="bg-primary p-6 text-white rounded-2xl">
          <div>Total price</div>
          <div className="text-3xl">${booking.booking_price}</div>
        </div>
      </div>
      <PlaceGallery place={booking} />
    </div>
  );
}
export default BookingPage;
