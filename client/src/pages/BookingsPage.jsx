import axios from "axios";
import React, { useEffect, useState } from "react";
import AccountNav from "../AccountNav";
import PlaceImg from "../PlaceImg";
import { differenceInCalendarDays, format } from "date-fns";
import { Link } from "react-router-dom";
import BookingDates from "../BookingDates";
function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    axios.get("/bookings").then((response) => {
      setBookings(response.data);
    });
  }, []);
  return (
    <div>
      <AccountNav />
      <div>
        {bookings?.length > 0 &&
          bookings.map((booking) => (
            <Link
              to={`/account/bookings/${booking.booking_id}`}
              className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden"
            >
              <div className="w-64">
                <PlaceImg place={booking} />
              </div>
              <div className="py-3 pr-3 grow">
                <h2 className="text-xl">{booking.title}</h2>
                <div className="">
                  <BookingDates booking={booking} />
                </div>
                <div className="text-l">
                  Number Of Nights :
                  {differenceInCalendarDays(
                    new Date(booking.booking_check_out),
                    new Date(booking.booking_check_in)
                  )}{" "}
                  <br></br>
                  Number Of Guests : {booking.numberofguests} <br></br>
                  <div className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                      />
                    </svg>
                    Total Price: ${booking.booking_price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
export default BookingsPage;
