import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };
  

  return (
    <div className="flex h-screen bg-white text-white">
      <div className="w-1/2 flex flex-col justify-center pl-20">
        <h1 className="text-6xl font-bold text-black">PARKEASE</h1>
        <p className="text-xl mt-4 text-yellow-500 font-bod">Your Parking Manager.</p>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center relative">
        <img
          src="https://cdni.iconscout.com/illustration/premium/thumb/online-taxi-booking-4865328-4046973.png" // replace with your image path
          alt="Parking Illustration"
          className="w-120 h-auto"
        />
        <button onClick={handleClick} className="absolute bottom-10 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
          login/sign up
        </button>
      </div>
    </div>
  );
}
