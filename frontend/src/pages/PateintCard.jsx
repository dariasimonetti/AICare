import { useState } from "react";
import userImage from '../assets/user.png';
import ExamGallery from '../components/ExamGallery';
import GrigliaInfo from '../components/GrigliaInfo';
import {
  updatePatientDetails
} from "../utils/api"; 
import EditPatientModal from "../components/EditPatientModal";

function PatientCard({ patient, setPatient, onCategoryResponse, isLoadingGlobal, setIsLoadingGlobal, copyTextToInput, isModalOpen, setModalOpen }) {
  

  const handleOpenModal = () => setModalOpen(true);

  const handleCloseModal = () => setModalOpen(false);



  const handleSave = async (updatedPatient) => {
    try {
      setIsLoadingGlobal(true); // Avvia il caricamento
      const updatedData = { ...updatedPatient }; // Copia dati paziente aggiornati
      await updatePatientDetails(patient._id, updatedData);
      setPatient(updatedPatient); // Chiama l'API per aggiornare il paziente
      setIsLoadingGlobal(false); // Termina il caricamento
      setModalOpen(false); // Chiudi la modale
    } catch (error) {
      console.error("Errore durante il salvataggio dei dati del paziente:", error);
      setIsLoadingGlobal(false);
    }
  };

  

  return (
    <div className="select-none max-w-4xl h-full bg-white shadow-lg rounded-lg p-6 flex flex-col items-center overflow-hidden">

      {/* Intestazione */}
      <div className="flex justify-center items-center w-full mb-6 gap-20">
        {/* Foto al centro-sinistra */}
        <div className="w-32 h-32 rounded-full bg-transparent flex-shrink-0 flex items-center">
        <ion-icon name="fitness-outline" style={{ color: "#2778A8" , fontSize:"120px"}}></ion-icon>
        </div>

        {/* Informazioni al centro-destra */}
        <div className=" text-left">
          <h2 className="text-3xl text-[#3660A9] font-bold">
            {patient.details.name} {patient.details.gender === "F" ? (
              <ion-icon name="female-outline" style={{ color: "#ff92a9" }}></ion-icon>
            ) : (
              <ion-icon name="male-outline" style={{ color: "#2778A8" }}></ion-icon>
            )}
          </h2>
          <br></br>
          <p className="text-black text-md flex items-center gap-2"> <ion-icon name="mail-outline" ></ion-icon> {patient.details.mail}</p>
          <p className="text-black text-md flex items-center gap-2"><ion-icon name="call-outline"></ion-icon>{patient.details.phone}</p>
          <p className="text-black text-md flex items-center gap-2"> <ion-icon name="location-outline"></ion-icon>{patient.details.location}</p>
          <p className="text-black text-md flex items-center gap-2"> <ion-icon name="calendar-number-outline"></ion-icon>{patient.details.birth_date} ({patient.details.age} years)</p>
        </div>
      </div>
      <p className='text-[#3660A9]'>Click the icons for mistral support:
        <br></br>
        <ion-icon name="chatbubble-ellipses-outline"/> to initiate the category analysis
        <br></br>
        <ion-icon name="arrow-redo-outline" /> to copy the text into the chat
      </p>
      <br></br>

      {/* Informazioni Mediche*/}
      
        <GrigliaInfo
          patient={ patient }
          onCategoryResponse={onCategoryResponse}
          isLoadingGlobal={isLoadingGlobal}
          setIsLoadingGlobal={setIsLoadingGlobal}
          copyTextToInput={copyTextToInput}
        ></GrigliaInfo>
      


      {/* Esami */}
      <br/> <br/><br/>
      <div className='flex justify-center items-center'>
      <h3 className="text-xl text-[#3660A9] font-bold">Patient's files and exams:</h3>
      </div>
      <br/> 
  
      
      <ExamGallery patientId={ patient._id }></ExamGallery>
      <br/>
      <button onClick={handleOpenModal} className="bg-[#3660A9] text-white px-4 py-2 rounded">
        Edit Patient <ion-icon name="pencil-outline"></ion-icon>
      </button>

      <EditPatientModal
        patient={patient}
        setPatient={setPatient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}

export default PatientCard;