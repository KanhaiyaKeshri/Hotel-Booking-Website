import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function handleChangeName(event) {
    const newValue = event.target.value;
    setName(newValue);
  }
  function handleChangeEmail(event) {
    const newValue = event.target.value;
    setEmail(newValue);
  }
  async function registerUser(event) {
    event.preventDefault();
    try {
      await axios.post("/register", {
        name,
        email,
        password,
      });
      alert("Registration Successful, Now you can Login");
    } catch (error) {
      alert("Registration Failed, Try again!");
    }
  }
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-32">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto " onSubmit={registerUser}>
          <input
            onChange={handleChangeName}
            type="text"
            placeholder="Your Name"
            value={name}
          />
          <input
            onChange={handleChangeEmail}
            type="email"
            placeholder="Youar Email Id"
            value={email}
          />
          <input
            onChange={(ev) => {
              setPassword(ev.target.value);
            }}
            type="password"
            placeholder="Password"
            value={password}
          />
          <button type="submit" className="button-color">
            Register
          </button>
          <div className="text-center py-2 text-gray-500">
            Already have an account?<span> </span>
            <Link className="underline text-black" to={"/login"}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default RegisterPage;
