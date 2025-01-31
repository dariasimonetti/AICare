import { useState } from "react";
import {
  addItemToList,
  deleteItemFromList,
} from "../utils/api"; 

function EditPatientModal({ patient, setPatient, isOpen, onClose, onSave }){
    // Stato locale che contiene tutti i dati del paziente
  const [formData, setFormData] = useState({ ...patient });

  const [expandedSections, setExpandedSections] = useState({
    bloodType: false,
    allergies: false,
    medications: false,
    previousMedications: false,
    carePlans: false,
    stoppedCarePlans: false,
    emergencyContacts: false,
    imagingStudies: false,
    immunizations: false,
    reports: false,
    procedures: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funzione per gestire i cambiamenti nei campi
  const handleChange = (path, value) => {
    // Supporta la modifica anche di campi annidati
    setFormData((prev) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // Salvataggio delle modifiche
  const handleSave = () => {
    onSave(formData); // Invio del paziente aggiornato al componente padre
    onClose(); // Chiudi la modale
  };

    // Funzione per aggiungere un nuovo elemento in una lista
    const handleAddToList = (listName, newItem) => {
      addItemToList(patient._id, listName, newItem)
        .then((response) => {
          // Aggiungi l'elemento alla lista localmente
          setFormData((prev) => {
            const updatedList = [...prev[listName], response];
            
            return { ...prev, [listName]: updatedList };
          });
        })
        .catch((error) => {
          console.error(`Error adding to ${listName}:`, error);
        });
    };

  // Funzione per eliminare un elemento da una lista
  const handleDeleteFromList = (listName, index) => {
    if (typeof index === "undefined") {
      console.error("Index is undefined. Cannot delete.");
      return;
    }
    deleteItemFromList(patient._id, listName, index)
      .then(() => {
        // Rimuovi l'elemento dalla lista localmente
        setFormData((prev) => {
          const updatedList = [...prev[listName]];
          updatedList.splice(index, 1); // Rimuove l'elemento localmente
          const updatedData = { ...prev, [listName]: updatedList };
          setPatient(updatedData); // Aggiorna lo stato globale del paziente
          return updatedData;
        });
      })
      .catch((error) => {
        console.error(`Error deleting from ${listName}:`, error);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal text-[#3660A9] fixed inset-0 flex items-center justify-center bg-gray-400 bg-opacity-30 z-50">
  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
    {/* Intestazione della Modale */}
    <div className="mb-6 flex justify-between items-center">
      <h2 className="text-xl font-bold">Change Patient Info</h2>
      <button
        onClick={onClose}
        className="bg-transparent text-lg font-semibold"
      >
        <ion-icon name="close-circle-outline" style={{fontSize: "24px", color: "#3660A9"}}></ion-icon>
      </button>
    </div>

    {/* Contenuto Scrollabile */}
    <div className="overflow-y-auto flex-grow pr-4 scrollbar scrollbar-thumb-[#3660A9] scrollbar-track-transparent">
      {/* Dettagli Personali */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("bloodType")}
        >
          <ion-icon
            name={
              expandedSections.bloodType
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Personal Details
        </span>
        {expandedSections.bloodType && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            <label className="flex flex-col">
                    Name:
                    <input
                    type="text"
                    value={formData.details.name}
                    onChange={(e) => handleChange("details.name", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Gender:
                    <select
                    value={formData.details.gender}
                    onChange={(e) => handleChange("details.gender", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 " 
                    >
                      <option value="" disabled hidden={!!formData.details.gender}>
                      Select gender
                    </option>
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                    </select>
                </label>

                <label className="flex flex-col">
                    Age:
                    <input
                    type="number"
                    value={formData.details.age}
                    onChange={(e) => handleChange("details.age", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Birth Date:
                    <input
                    type="date"
                    value={formData.details.birth_date}
                    onChange={(e) => handleChange("details.birth_date", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Marital Status:
                    <select
                    value={formData.details.marital_status}
                    onChange={(e) => handleChange("details.marital_status", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    >
                    <option value="S">Single</option>
                    <option value="M">Married</option>
                    <option value="D">Divorced</option>
                    <option value="W">Widower</option>
                    </select>
                </label>

                <label className="flex flex-col">
                    Email:
                    <input
                    type="email"
                    value={formData.details.mail}
                    onChange={(e) => handleChange("details.mail", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Phone:
                    <input
                    type="text"
                    value={formData.details.phone}
                    onChange={(e) => handleChange("details.phone", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Blood Type:
                    <input
                    type="text"
                    value={formData.details.blood_type}
                    onChange={(e) => handleChange("details.blood_type", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Address:
                    <input
                    type="text"
                    value={formData.details.location}
                    onChange={(e) => handleChange("details.location", e.target.value)}
                    className="border bg-white text-black p-2 rounded border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 "
                    />
                </label>

                <label className="flex flex-col">
                    Emergency Contact:
                    <textarea
                    value={formData.details.contact_emergency}
                    onChange={(e) => handleChange("details.contact_emergency", e.target.value)}
                    className="flex-grow text-black bg-white border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300  h-10 resize-none scrollbar scrollbar-thumb-[#3660A9] scrollbar-track-transparent  p-2"
                    ></textarea>
                </label>
          </section>
        )}
      </div>

      {/* Allergie */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("allergies")}
        >
          <ion-icon
            name={
              expandedSections.allergies
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Allergies
        </span>
        {expandedSections.allergies && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.allergies.map((allergy, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="text"
                    value={allergy.date}
                    onChange={(e) =>
                      handleChange(`allergies.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>
                <label className="flex flex-col">
                  Description:
                  <input
                    type="text"
                    value={allergy.description}
                    onChange={(e) =>
                      handleChange(
                        `allergies.${index}.description`,
                        e.target.value
                      )
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>
                <button
                  onClick={() => handleDeleteFromList("allergies", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9]"
                >
                  <ion-icon name="trash-outline" style={{fontSize : "18px"}}></ion-icon>
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                handleAddToList("allergies", { date: "YYYY-MM-DD", description: "null" })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md "
            >
              New Allergy
            </button>
          </section>
        )}
      </div>

      {/* Medications */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("medications")}
        >
          <ion-icon
            name={
              expandedSections.medications
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Medications
        </span>
        {expandedSections.medications && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.medications.map((medication, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="date"
                    value={medication.date}
                    onChange={(e) =>
                      handleChange(`medications.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Status:
                  <select
                    value={medication.status}
                    onChange={(e) =>
                      handleChange(`medications.${index}.status`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  >
                    <option value="CURRENT">CURRENT</option>
                    <option value="STOPPED">STOPPED</option>
                  </select>
                </label>

                <label className="flex flex-col">
                  Name and Reason:
                  <textarea
                    value={medication.name_and_reason}
                    onChange={(e) =>
                      handleChange(
                        `medications.${index}.name_and_reason`,
                        e.target.value
                      )
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  ></textarea>
                </label>

                <button
                  onClick={() => handleDeleteFromList("medications", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md hover:bg-[#25477D] transition duration-300"
                >
                  <ion-icon name="trash-outline" style={{fontSize : "18px"}}></ion-icon>
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere una nuova medication */}
            <button
              onClick={() =>
                handleAddToList("medications", {
                  date: "YYYY-MM-DD", // Data di default: oggi
                  status: "CURRENT", // Stato di default
                  name_and_reason: "", // Nome e motivo vuoto
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Medication
            </button>
          </section>
        )}
      </div>

      {/* Conditions */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("conditions")}
        >
          <ion-icon
            name={
              expandedSections.conditions
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Conditions
        </span>
        {expandedSections.conditions && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.conditions.map((condition, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date Range:
                  <input
                    type="text"
                    value={condition.date_range}
                    onChange={(e) =>
                      handleChange(`conditions.${index}.date_range`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Description:
                  <textarea
                    value={condition.description}
                    onChange={(e) =>
                      handleChange(
                        `conditions.${index}.description`,
                        e.target.value
                      )
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  ></textarea>
                </label>

                <button
                  onClick={() => handleDeleteFromList("conditions", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md hover:bg-[#25477D] transition duration-300"
                >
                  <ion-icon name="trash-outline" style={{fontSize : "18px"}}></ion-icon>
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere una nuova condition */}
            <button
              onClick={() =>
                handleAddToList("conditions", {
                  date_range: "YYYY-MM-DD - today", // Valore di default
                  description: "", // Descrizione vuota
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Condition
            </button>
          </section>
        )}
      </div>

      {/* Care Plans */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("carePlans")}
        >
          <ion-icon
            name={
              expandedSections.carePlans
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Care Plans
        </span>
        {expandedSections.carePlans && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.care_plans.map((plan, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="text"
                    value={plan.date}
                    onChange={(e) =>
                      handleChange(`care_plans.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Type:
                  <input
                    type="text"
                    value={plan.type}
                    onChange={(e) =>
                      handleChange(`care_plans.${index}.type`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Reason:
                  <textarea
                    value={plan.reason}
                    onChange={(e) =>
                      handleChange(`care_plans.${index}.reason`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  ></textarea>
                </label>

                <label className="flex flex-col">
                  Activities:
                  <div className="flex flex-col gap-2">
                    {plan.activities.map((activity, activityIndex) => (
                      <div key={activityIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) =>
                            handleChange(
                              `care_plans.${index}.activities.${activityIndex}`,
                              e.target.value
                            )
                          }
                          className="flex-grow border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                        />
                        <button
                          onClick={() =>
                            handleDeleteFromList(
                              `care_plans.${index}.activities`,
                              activityIndex
                            )
                          }
                          className="text-white bg-[#3660A9] px-2 py-1 rounded-md"
                        >
                          <ion-icon name="trash-outline" style={{fontSize : "14px"}}></ion-icon>
                        </button>
                      </div>
                    ))}
                    {/* Pulsante per aggiungere una nuova attività */}
                    <button
                      onClick={() =>
                        handleAddToList(`care_plans.${index}.activities`, "")
                      }
                      className="bg-[#3660A9] text-white px-4 py-2 rounded-md "
                    >
                      Add Activity
                    </button>
                  </div>
                </label>

                <button
                  onClick={() => handleDeleteFromList("care_plans", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md"
                >
                  Delete Care Plan
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere un nuovo care plan */}
            <button
              onClick={() =>
                handleAddToList("care_plans", {
                  date: "YYYY-MM-DD[CURRENT]", // Default
                  type: "", // Vuoto
                  reason: "", // Vuoto
                  activities: [], // Lista vuota
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Care Plan
            </button>
          </section>
        )}
      </div>

      {/* Reports */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("reports")}
        >
          <ion-icon
            name={
              expandedSections.reports
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Reports
        </span>
        {expandedSections.reports && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.reports.map((report, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="date"
                    value={report.date}
                    onChange={(e) =>
                      handleChange(`reports.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Type:
                  <input
                    type="text"
                    value={report.type}
                    onChange={(e) =>
                      handleChange(`reports.${index}.type`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Details:
                  <div className="flex flex-col gap-2">
                    {report.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) =>
                            handleChange(
                              `reports.${index}.details.${detailIndex}`,
                              e.target.value
                            )
                          }
                          className="flex-grow border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                        />
                        <button
                          onClick={() =>
                            handleDeleteFromList(
                              `reports.${index}.details`,
                              detailIndex
                            )
                          }
                          className="text-white bg-[#3660A9] px-2 py-1 rounded-md"
                        >
                          <ion-icon name="trash-outline" style={{fontSize : "14px"}}></ion-icon>
                        </button>
                      </div>
                    ))}
                    {/* Pulsante per aggiungere un nuovo dettaglio */}
                    <button
                      onClick={() =>
                        handleAddToList(`reports.${index}.details`, "")
                      }
                      className="bg-[#3660A9] text-white px-4 py-2 rounded-md hover:bg-[#25477D] transition duration-300"
                    >
                      Add Detail
                    </button>
                  </div>
                </label>

                <button
                  onClick={() => handleDeleteFromList("reports", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md hover:bg-[#25477D] transition duration-300"
                >
                  Delete Report
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere un nuovo report */}
            <button
              onClick={() =>
                handleAddToList("reports", {
                  date: "YYYY-MM-DD", // Data di default
                  type: "", // Tipo vuoto
                  details: [], // Lista vuota per i dettagli
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Report
            </button>
          </section>
        )}
      </div>

      {/* Procedures */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("procedures")}
        >
          <ion-icon
            name={
              expandedSections.procedures
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Procedures
        </span>
        {expandedSections.procedures && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.procedures.map((procedure, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="date"
                    value={procedure.date}
                    onChange={(e) =>
                      handleChange(`procedures.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Description:
                  <textarea
                    value={procedure.description}
                    onChange={(e) =>
                      handleChange(`procedures.${index}.description`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  ></textarea>
                </label>

                <button
                  onClick={() => handleDeleteFromList("procedures", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md hover:bg-[#25477D] transition duration-300"
                >
                  <ion-icon name="trash-outline" style={{fontSize : "18px"}}></ion-icon>
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere una nuova procedura */}
            <button
              onClick={() =>
                handleAddToList("procedures", {
                  date: "YYYY-MM-DD", // Data di default
                  description: "", // Descrizione vuota
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Procedure
            </button>
          </section>
        )}
      </div>

      {/* Immunizations */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("immunizations")}
        >
          <ion-icon
            name={
              expandedSections.immunizations
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Immunizations
        </span>
        {expandedSections.immunizations && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.immunizations.map((immunization, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="date"
                    value={immunization.date}
                    onChange={(e) =>
                      handleChange(`immunizations.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Vaccine:
                  <input
                    type="text"
                    value={immunization.vaccine}
                    onChange={(e) =>
                      handleChange(`immunizations.${index}.vaccine`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <button
                  onClick={() => handleDeleteFromList("immunizations", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md hover:bg-[#25477D] transition duration-300"
                >
                  <ion-icon name="trash-outline" style={{fontSize : "18px"}}></ion-icon>
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere una nuova immunizzazione */}
            <button
              onClick={() =>
                handleAddToList("immunizations", {
                  date: "YYYY-MM-DD", // Data di default
                  vaccine: "", // Nome vaccino vuoto
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Immunization
            </button>
          </section>
        )}
      </div>

      {/* Imaging Studies */}
      <div className="mb-6">
        <span
          className="select-none font-bold text-xl text-[#3660A9] cursor-pointer"
          onClick={() => toggleSection("imagingStudies")}
        >
          <ion-icon
            name={
              expandedSections.imagingStudies
                ? "chevron-up-circle-outline"
                : "chevron-down-circle-outline"
            }
            style={{ marginRight: "10px" }}
          ></ion-icon>
          Imaging Studies
        </span>
        {expandedSections.imagingStudies && (
          <section className="grid grid-cols-2 gap-4 mt-4 p-5 bg-gray-100 rounded-lg">
            {formData.imaging_studies.map((study, index) => (
              <div
                key={index}
                className="border border-[#3660A9] p-4 rounded-md shadow-md flex flex-col gap-2"
              >
                <label className="flex flex-col">
                  Date:
                  <input
                    type="date"
                    value={study.date}
                    onChange={(e) =>
                      handleChange(`imaging_studies.${index}.date`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  />
                </label>

                <label className="flex flex-col">
                  Description:
                  <textarea
                    value={study.description}
                    onChange={(e) =>
                      handleChange(`imaging_studies.${index}.description`, e.target.value)
                    }
                    className="border bg-white text-black p-2 rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300"
                  ></textarea>
                </label>

                <button
                  onClick={() => handleDeleteFromList("imaging_studies", index)}
                  className="text-white text-sm font-semibold self-end bg-[#3660A9] p-2 rounded-md hover:bg-[#25477D] transition duration-300"
                >
                  <ion-icon name="trash-outline" style={{fontSize : "18px"}}></ion-icon>
                </button>
              </div>
            ))}

            {/* Pulsante per aggiungere un nuovo imaging study */}
            <button
              onClick={() =>
                handleAddToList("imaging_studies", {
                  date: "YYYY-MM-DD", // Data di default
                  description: "", // Descrizione vuota
                })
              }
              className="col-span-2 bg-[#3660A9] text-white p-2 rounded-md hover:bg-[#25477D] transition-colors duration-300"
            >
              New Imaging Study
            </button>
          </section>
        )}
      </div>

    </div>

    {/* Footer della Modale */}
    <div className="mt-6 flex justify-end gap-4">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md "
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-[#3660A9] text-white rounded-md "
      >
        Save
      </button>
    </div>
  </div>
</div>

  );

}

export default EditPatientModal