import React, { useEffect, useState } from "react";
import PhotosUploader from "../PhotosUploader";
import Perks from "../Perks";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);

  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/places/" + id).then((response) => {
      const { data } = response;
      setTitle(data.title);
      setAddress(data.address);
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extra_info);
      setCheckIn(data.check_in);
      setCheckOut(data.check_out);
      setMaxGuests(data.max_guests);
      setPrice(data.price);
    });
  }, [id]);
  function inputHeader(text) {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  }
  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }
  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };
    if (id) {
      // update
      await axios.put("/places", {
        id,
        ...placeData,
      });
      setRedirect(true);
    } else {
      // new place
      await axios.post("/places", placeData);
      setRedirect(true);
    }
  }
  if (redirect) {
    return <Navigate to={"/account/places"} />;
  }
  return (
    <div>
      <AccountNav />
      <form onSubmit={savePlace}>
        {preInput(
          "Title",
          "Title for your place. should be short and catchy as in advertisement"
        )}
        <input
          type="text"
          value={title}
          onChange={(ev) => {
            setTitle(ev.target.value);
          }}
          placeholder="title, for example: My lovely Apartment"
        />
        {preInput("Address", "Address to this place")}
        <input
          type="text"
          value={address}
          onChange={(ev) => {
            setAddress(ev.target.value);
          }}
          placeholder="address"
        />

        {preInput("Photos", "more = better")}
        <PhotosUploader
          addedPhotos={addedPhotos}
          setAddedPhotos={setAddedPhotos}
        />
        {preInput("Description", "description of the place")}
        <textarea
          value={description}
          onChange={(ev) => {
            setDescription(ev.target.value);
          }}
        />
        {preInput("Perks", "select all the perks of your place")}
        <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Perks selected={perks} onChange={setPerks} />
        </div>
        {preInput("Extra info", "house rules, etc")}
        <textarea
          value={extraInfo}
          onChange={(ev) => {
            setExtraInfo(ev.target.value);
          }}
        />
        {preInput(
          "Check in&out times",
          "add check in and out times, remember to have some time window for cleaning the room between guests"
        )}
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mt-2 -mb-1"> Check In Time</h3>
            <input
              type="number"
              value={checkIn}
              onChange={(ev) => {
                setCheckIn(ev.target.value);
              }}
              placeholder="12:00"
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1"> Check Out Time</h3>
            <input
              type="number"
              value={checkOut}
              onChange={(ev) => {
                setCheckOut(ev.target.value);
              }}
              placeholder="6:00"
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max Number of Guests.</h3>
            <input
              type="number"
              value={maxGuests}
              onChange={(ev) => {
                setMaxGuests(ev.target.value);
              }}
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">One day Price</h3>
            <input
              type="number"
              value={price}
              onChange={(ev) => {
                setPrice(ev.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button className="primary my-4 max-w-sm">Save</button>
        </div>
      </form>
    </div>
  );
}
export default PlacesFormPage;
