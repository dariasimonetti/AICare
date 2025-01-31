import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { login } from "../utils/api";
import Navbar from '../components/Navbar';

function Login(){
  const [email, setEmail] = useState(""); // Stato per l'email
  const [password, setPassword] = useState(""); // Stato per la password
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async () => {
    try {
      // Effettua il login tramite API
      const response = await login(email, password);
  
      // Salva le informazioni del dottore in sessionStorage
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("doctorId", response.doctor_id);
      sessionStorage.setItem("doctorName", response.name);
      sessionStorage.setItem("doctorSurname", response.surname);
      sessionStorage.setItem("doctorWorkplace", response.workplace);
      sessionStorage.setItem("doctorEmail", email);
  
      // Reindirizza alla home
      navigate("/home");
    } catch (error) {
      alert(error.message); // Mostra il messaggio di errore dal backend
    }
  };

  return (
    <>
    <div
      className="select-none relative min-h-screen bg-opacity-90 bg-cover bg-center"
      style={{
        background: "linear-gradient(to right, #2778A8 0%, #3660A9 30%, #3660A9 70%, #2778A8 100%)",        
      }}
    >
      
      
      <div className="min-h-screen sm:flex sm:flex-row mx-0 justify-center">
        <div className="flex-col flex self-center p-10 sm:max-w-5xl xl:max-w-2xl z-10">
          <div className="self-start hidden lg:flex flex-col items-center text-white">
            <img
              src="logo.png"
              style={{
                width: "50%",
                height: "auto", 
                opacity: 0.9, 
              }}
              alt="logo"
              className="mb-6"
            />
            {/* Scritta centrata rispetto all'immagine */}
            <h1 className="font-bold text-5xl text-center">Welcome to AICare!</h1>
          </div>
        </div>
        <div className="flex justify-center self-center z-10">
          <div className="p-12 bg-white mx-auto rounded-2xl w-100">
            <div className="mb-4">
              <h3 className="font-semibold text-2xl text-[#3660A9]">Login</h3>
              <p className="text-[#3660A9]/70">Please log into your account.</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#3660A9] tracking-wide">
                  Email
                </label>
                <input
                  className="w-full text-base text-black px-4 py-2 bg-gray-50 border border-[#3660A9] rounded-lg focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  type="email"
                  placeholder="mail@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="mb-5 text-sm font-medium text-[#3660A9] tracking-wide">
                  Password
                </label>
                <div className="relative">
                  {/* Input per la password */}
                  <input
                    className="w-full text-base text-black px-4 py-2 pr-10 bg-gray-50 border border-[#3660A9] rounded-lg focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLogin(); // Effettua il login quando premi Enter
                      }
                    }}
                  />
                  {/* Pulsante per mostrare/nascondere la password */}
                  <button
                    className="border-none focus:outline-none absolute right-0 top-1/2 transform -translate-y-1/2 text-[#3660A9] bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <ion-icon
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      className="text-2xl"
                    ></ion-icon>
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div className="text-sm">
                  <a href="#" className="text-[#3660A9]/60 hover:text-[#3660A9]">
                    Forgot your password?
                  </a>
                </div>
              </div>
              <div>
                <button
                  onClick={handleLogin}
                  className="w-full flex justify-center bg-[#3660A9]/90 hover:bg-[#3660A9] text-white p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );

}

export default Login