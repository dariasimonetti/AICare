import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Subnavbar from "../components/Subnavbar";
import PatientCard from "./PateintCard";
import LlmInterface from "./LlmInterface";
import { getPatients} from "../utils/api";
import { useRef, useState, useEffect } from "react";

function Home () {
  const [refreshPatients, setRefreshPatients] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  const [input, setInput] = useState("");

  const llmRef = useRef(null);
  const doctorEmail = sessionStorage.getItem("doctorEmail");
  const llmInputRef = useRef(null);

  const copyTextToInput = (text) => {
    setInput((prevInput) => prevInput + (prevInput ? " " : "") + text); // Concatenazione dei testi
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getPatients(doctorEmail);
  
        if (response.length > 0) {
          setSelectedPatient(response[0]); 
          setPatients(response.slice(1)); 
        } else {
          setPatients([]);
        }
      } catch (error) {
        console.error("Errore nel recupero dei pazienti:", error.message);
      }
    };
  
    if (doctorEmail) {
      fetchPatients();
    }
  }, [doctorEmail]);
  

  // Funzione per gestire lo swap tra `PatientCard` e `Sidebar`
  const handlePatientSwap = (clickedPatient) => {

    // Resetta i messaggi nella LlmInterface
    if (llmRef.current) {
      llmRef.current.resetMessages();
    }

    const clickedIndex = patients.findIndex((p) => p._id === clickedPatient._id);
    const updatedPatients = patients.filter((p) => p._id !== clickedPatient._id);
    if (selectedPatient) {
      updatedPatients.splice(clickedIndex, 0, selectedPatient);
    }
    setPatients(updatedPatients);
    setSelectedPatient(clickedPatient);

    setTimeout(() => {
      setIsSidebarOpen(false);
    });
  };
  
  const handleCategoryResponse = (categoryName, response) => {
    if (llmRef.current) {
      llmRef.current.addMessageToChat(`${categoryName}`, response);
    }
  };

  return (
    <>
    <div className="h-screen overflow-y-auto scrollbar scrollbar-thumb-[#3660A9] scrollbar-track-transparent flex flex-col bg-gray-100 ">
      <Navbar />
      <Subnavbar refreshPatients={refreshPatients} />

      <div className="flex flex-1">

        <Sidebar
          patients={patients} 
          onPatientClick={handlePatientSwap} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => !isLoadingGlobal && setIsSidebarOpen(true)}
          isLoading={isLoadingGlobal}
          setPatients={setPatients}
          selectedPatient={selectedPatient}
          setSelPat={setSelectedPatient}
          setIsModalOpen={setModalOpen}
          setRefreshPatients={setRefreshPatients}
        />

        <div className="flex flex-1 flex-col xl:flex-row gap-6 p-6">
          {selectedPatient && (
            <div className="flex-grow max-w-4xl">
            <PatientCard
              key={selectedPatient._id}
              patient={selectedPatient}
              setPatient={setSelectedPatient}
              onCategoryResponse={handleCategoryResponse}
              isLoadingGlobal={isLoadingGlobal}
              setIsLoadingGlobal={setIsLoadingGlobal}
              copyTextToInput={copyTextToInput}
              isModalOpen={isModalOpen}
              setModalOpen={setModalOpen}
            />
            </div>
          )}

          {/* LlmInterface */}
          <div className="flex-grow ">
            <LlmInterface
              ref={llmRef}
              patientId={selectedPatient?._id}
              isLoadingGlobal={isLoadingGlobal}
              setIsLoadingGlobal={setIsLoadingGlobal}
              inputRef={llmInputRef}
              input={input}
              setInput={setInput}
            />
          </div>
          
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
