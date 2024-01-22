import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Indexpage() {
  const [places, setPlaces] = useState([]);
  useEffect(() => {
    axios.get("/places").then((response) => {
      setPlaces(response.data);
    });
  }, []);

  return (
    <div className=" mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      {places.length > 0 &&
        places.map((place, index) => (
          <Link to={"/place/" + place.place_id} key={index}>
            <div className=" mb-2 bg-gray-500 rounded-2xl flex">
              {place.photos?.[0] && (
                <img
                  className="rounded-2xl object-cover aspect-square"
                  src={`http://localhost:3000/uploads/${place.photos[0]}`}
                />
              )}
            </div>
            <h2 className="font-bold mb-1">{place.address}</h2>
            <h3 className="text-sm text-gray-500">{place.title}</h3>
            <div className="mt-1">
              <span className="font-bold">${place.price}</span> per night
            </div>
          </Link>
        ))}
    </div>
  );
}

export default Indexpage;
