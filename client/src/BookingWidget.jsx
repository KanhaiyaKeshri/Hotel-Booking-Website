import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { UserContext } from "./UserContext";

function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.username);
    }
  }, [user]);

  let numberOFNights = 0;
  if (checkIn && checkOut) {
    numberOFNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }
  async function bookThisPlace() {
    const response = await axios.post("/bookings", {
      place_id: place.place_id,
      checkIn,
      checkOut,
      name,
      phone,
      price: numberOFNights * place.price,
      numberOfGuests,
    });
    const booking_id = response.data.booking_id;
    setRedirect(`/account/bookings/${booking_id}`);
  }
  if (redirect) {
    return <Navigate to={redirect} />;
  }
  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price: ${place.price}/per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4 ">
            <label>Check In :</label>
            <input
              type="date"
              value={checkIn}
              onChange={(ev) => {
                setCheckIn(ev.target.value);
              }}
            />
          </div>
          <div className=" py-3 px-4 border-l ">
            <label>Check Out :</label>
            <input
              type="date"
              value={checkOut}
              onChange={(ev) => {
                setCheckOut(ev.target.value);
              }}
            />
          </div>
        </div>
        <div className=" py-3 px-4 border-t ">
          <label>Number of Guests :</label>
          <input
            type="number"
            min="1"
            value={numberOfGuests}
            onChange={(ev) => {
              setNumberOfGuests(ev.target.value);
            }}
          />
        </div>
        {numberOFNights > 0 && (
          <div className=" py-3 px-4 border-t ">
            <label>Your Full Name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => {
                setName(ev.target.value);
              }}
            />
            <label>Your Mobile Number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(ev) => {
                setPhone(ev.target.value);
              }}
            />
          </div>
        )}
      </div>

      <button onClick={bookThisPlace} className="primary mt-4">
        Book this place
        {numberOFNights > 0 && <span> ${numberOFNights * place.price} </span>}
      </button>
    </div>
  );
}
export default BookingWidget;
