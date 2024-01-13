import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { setUser } = useContext(UserContext);
  async function handleLoginChange(event) {
    event.preventDefault();
    try {
      const { data } = await axios.post("/login", {
        email,
        password,
      });
      setUser(data);
      alert("Login Successful!");
      setRedirect(true);
    } catch (error) {
      console.log(error);
      alert("Login Failed");
    }
  }
  if (redirect) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-32">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginChange}>
          <input
            onChange={(ev) => {
              setEmail(ev.target.value);
            }}
            type="email"
            placeholder="Email Id"
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
            Login
          </button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet?<span> </span>
            <Link className="underline text-black" to={"/register"}>
              Register Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default LoginPage;
