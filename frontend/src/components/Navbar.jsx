import { useNavigate } from "react-router-dom";

function Navbar(){

  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear(); // Rimuove tutte le informazioni salvate
    navigate("/"); // Reindirizza alla root o alla pagina di login
  };

  return (
      <nav className=" select-none text-white shadow-md w-full"
          style={{
            background: "linear-gradient(to right, #2778A8 0%, #3660A9 50%, #3660A9 60%, #2778A8 100%)",        
          }}
      >

        <div className="flex justify-center items-center h-20 relative">
          
          {/* Centro: Logo enorme */}
          <div className="flex justify-center items-center ">
          <div className="text-4xl font-bold">AI</div>
            <img
              src="/logo.png" // Sostituisci con il link o il percorso del tuo logo
              alt="Logo"
              className="h-20 w-auto" // Altezza grande, larghezza automatica
            />
            <div className="text-4xl font-bold">Care</div>
          </div>
  
          {/* Destra: Pulsante */}
          <div className="absolute right-5">
            <button
              onClick={handleLogout}
              className="bg-white text-[#3660A9] font-semibold rounded-lg hover:bg-gray-200 text-md flex items-center justify-center">
                Logout
                <ion-icon name="log-out" size="large"></ion-icon>
            </button>
          </div>
        </div>
      </nav>
    );
}

export default  Navbar;