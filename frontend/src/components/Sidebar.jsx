import PatientPreview from "./PatientPreview";
import EditPatientModal from "./EditPatientModal";
import { createNewPatient } from "../utils/api";
import { useState } from "react";


function Sidebar({ patients, onPatientClick, isOpen, onClose, onOpen, isLoading, selectedPatient, setSelPat, setIsModalOpen, setPatients, setRefreshPatients}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Funzione per filtrare i pazienti in base alla barra di ricerca
  const filteredPatients = patients.filter((patient) =>
    patient.details.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewPatient = async () => {
    try {
      
      const doctorEmail = sessionStorage.getItem("doctorEmail"); // Recupero dell'email dalla sessione
      console.log("Doctor Email:", doctorEmail);
      const newPatient = await createNewPatient(doctorEmail);
      setPatients((prevPatients) => {
        // Se esiste un paziente selezionato, lo aggiungiamo alla lista
        const updatedPatients = selectedPatient ? [...prevPatients, selectedPatient] : [...prevPatients];
        return updatedPatients; // Aggiungiamo anche il nuovo paziente
      });
      setSelPat(newPatient);
      setRefreshPatients((prev) => !prev);
      onClose();
      setIsModalOpen(true); // Apri la modale
      
    } catch (error) {
      console.error("Error creating new patient:", error);
    }
  };

  return (
    <>
      <div className="select-none flex justify-center items-center min-h-screen">
        <div>

          {/* Sidebar e Overlay */}
          <div className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
            <div
              className={`absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={onClose}
            ></div>

            <section className="absolute inset-y-0 left-0 max-w-full flex">
              <div
                className={`w-screen max-w-md h-full flex flex-col py-6 bg-white border rounded-xl shadow-xl transform transition-transform duration-300 ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-xl font-semibold text-[#3660A9]">
                    Search
                  </h2>
                  <button
                  onClick={handleAddNewPatient}
                    className="text-white hover:text-gray-200 bg-[#3660A9]"
                  >
                    <span className="flex items-center justify-center">
                      <ion-icon name="person-add-outline" size="large"></ion-icon>
                    </span>
                  </button>
                </div>

                {/* Search Input */}
                <div className="mt-4 px-4">
                  <input
                    type="text"
                    placeholder="Search patient here"
                    className="w-full p-2 text-black bg-gray-50 border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="mt-4 px-4">
                  <p className="ml-2 text-[#3660A9]/60">Results</p>
                </div>

                {/* Sidebar Content */}
                <div className="mt-4 px-4 h-full overflow-auto scrollbar scrollbar-thumb-[#3660A9] scrollbar-track-transparent">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, index) => (
                        <PatientPreview
                          onClick={() => onPatientClick(patient)}
                          key={`${patient._id}-${index}`}
                          nome={patient.details.name}
                          eta={patient.details.age}
                          sesso={patient.details.gender}
                        />
                      ))
                    ) : (
                      <p className="text-center text-[#3660A9]/60">
                        No patients found
                      </p>
                    )}
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="mt-6 px-4">
                  <button className="flex justify-center items-center bg-[#3660A9] text-white rounded-md text-sm p-2 gap-1">
                    <ion-icon name="options"></ion-icon>
                    Filters
                  </button>
                </div>
              </div>
            </section>
          </div>
          

          {/* Open sidebar button */}
          <button
            onClick={() => !isLoading && onOpen()}
            disabled={isLoading}
            style={{cursor: !isLoading? "pointer": "not-allowed"}}
            className="w-12 h-12 bg-[#3660A9]/80 text-white rounded-full shadow-md fixed top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center hover:translate-x-1 hover:bg-[#3660A9] transition-all duration-300"
          >
            <span className="flex items-center justify-center">
              <ion-icon name="people" style={{ fontSize: "24px" }}></ion-icon>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;



