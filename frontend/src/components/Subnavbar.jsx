import React, { useEffect, useState } from "react";
import { getPatientCount } from "../utils/api";

function Subnavbar({ refreshPatients }){
    const [patientCount, setPatientCount] = useState(0);
    const doctorName = sessionStorage.getItem("doctorName");
    const doctorSurname = sessionStorage.getItem("doctorSurname");
    const doctorWorkplace = sessionStorage.getItem("doctorWorkplace");
    const doctorEmail = sessionStorage.getItem("doctorEmail");

    useEffect(() => {
      const fetchPatientCount = async () => {
        try {
          const count = await getPatientCount(doctorEmail);
          setPatientCount(count);
        } catch (error) {
          console.error("Errore nel conteggio dei pazienti:", error.message);
        }
      };

      if (doctorEmail) {
        fetchPatientCount();
      }
    }, [refreshPatients]);

    return (
        <>
        <nav className="select-none bg-[#3660A9] text-white w-full shadow-md">
            <div className="flex justify-between items-center px-6 h-6 text-sm font-medium">
            {/* Sinistra */}
            <div className="flex items-center">
                <span className="font-semibold">Dr. {doctorName} {doctorSurname}</span>
            </div>
            {/* Centro */}
            <div className="flex items-center">
                <span>{patientCount} patients in care</span>
            </div>
            {/* Destra */}
            <div className="flex items-center">
                <span>{doctorWorkplace}</span>
            </div>
            </div>
        </nav>
        </>
    )

}

export default Subnavbar