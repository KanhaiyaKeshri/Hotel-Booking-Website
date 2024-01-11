import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-32">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Youar Email Id" />
          <input type="password" placeholder="Password" />
          <button className="button-color">Register</button>
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
