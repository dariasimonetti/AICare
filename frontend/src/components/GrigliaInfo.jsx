import { useState } from "react";
import { sendCategoryToLLM , getComprehensiveAnalysis} from "../utils/api";

function GrigliaInfo({ patient, onCategoryResponse, isLoadingGlobal, setIsLoadingGlobal, copyTextToInput }) {

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

  const handleSendCategory = async (categoryName, categoryText) => {
    setIsLoadingGlobal(true);
  
    // Aggiungi subito il messaggio dell'utente alla chat
    if (onCategoryResponse) {
      onCategoryResponse(`Analysis for ${categoryName}`, ""); // Mostra subito un messaggio vuoto o un placeholder
    }
  
    try {
      const response = await sendCategoryToLLM(patient._id, categoryName, categoryText);
  
      // Aggiorna il messaggio con la risposta
      if (onCategoryResponse) {
        onCategoryResponse(categoryName, response);
      }
    } catch (error) {
      console.error("Errore durante l'invio della categoria:", error);
      alert("Errore durante l'invio della categoria. Riprova più tardi.");
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const handleComprehensiveAnalysis = async () => {
    if (isLoadingGlobal) return;
  
    setIsLoadingGlobal(true); // Attiva il caricamento
  
    // Aggiungi subito il messaggio dell'utente alla chat
    if (onCategoryResponse) {
      onCategoryResponse("Comprehensive Analysis", ""); // Mostra subito un placeholder vuoto
    }
  
    try {
      const response = await getComprehensiveAnalysis(patient._id);
  
      // Passa la risposta alla chat
      if (onCategoryResponse) {
        onCategoryResponse("Assistant: Comprehensive Analysis", response);
      }
    } catch (error) {
      console.error("Errore durante l'analisi completa:", error);
      alert("Errore durante l'analisi completa. Riprova più tardi.");
    } finally {
      setIsLoadingGlobal(false); // Disattiva il caricamento
    }
  };


  return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 select-text" style={{ boxShadow: "0 0 10px #3660A9" }}>
        <div className="grid grid-cols-2 gap-6 divide-x divide-gray-200 text-black text-md ">
          {/* Gruppo 1 */}
          <div className="pr-4">
            
            {/* Blood Type */}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("bloodType")}>
                <ion-icon name={expandedSections.bloodType ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{marginRight:"10px", cursor:"pointer"}}></ion-icon>Blood Type</span>
                <span className={`font-bold text-xl ${patient.details.blood_type ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.details.blood_type && !isLoadingGlobal && handleSendCategory("Blood Type", patient.details.blood_type || "No data")}></ion-icon></span>

              {expandedSections.bloodType && (
                <span className="break-words w-full mt-2">
                  {patient.details.blood_type || "Not specified"}
                  {patient.details.blood_type && (
                  <ion-icon name="arrow-redo-outline" 
                    style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                    onClick={() => copyTextToInput(patient.details.blood_type)}
                  />)}
                </span>
              )}
            </div>

            {/* Allergies */}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("allergies")}>
                <ion-icon name={expandedSections.allergies ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{marginRight:"10px", cursor:"pointer"}}></ion-icon>Allergies</span>
                <span className={`font-bold text-xl ${patient.allergies.length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.allergies.length > 0 && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.allergies.length > 0  && !isLoadingGlobal && handleSendCategory("Allergies", patient.allergies || "No data")}></ion-icon></span>
              
              {expandedSections.allergies && (
                <span className="break-words w-full mt-2">
                  {patient.allergies.length > 0 ? (
                    <ul className="list-disc pl-5 marker:text-[#3660A9]">
                      {patient.allergies.map((allergy, index) => (
                        <li key={index}>
                          {allergy.description} [{allergy.date}]
                          <ion-icon name="arrow-redo-outline" 
                            style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                            onClick={() => copyTextToInput(`${allergy.description} [${allergy.date}]`)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No recorded allergies"
                  )}
                </span>
              )}
            </div>

            {/*Medications */}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("medications")}>
                <ion-icon name={expandedSections.medications ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px", cursor:"pointer" }}></ion-icon>Current Medications</span>
                <span className={`font-bold text-xl ${patient.medications.filter((med) => med.status === "CURRENT").length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.medications.filter((med) => med.status === "CURRENT").length > 0 && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.medications.filter((med) => med.status === "CURRENT").length > 0  && !isLoadingGlobal && handleSendCategory("Current Medications", patient.medications.filter((med) => med.status === "CURRENT") || "No data")}></ion-icon></span>

              {expandedSections.medications && (
                <span className="break-words w-full mt-2">
                  {/* Current Medications */}
                  {patient.medications.filter((med) => med.status === "CURRENT").length > 0 ? (
                    <ul className="list-disc pl-5 marker:text-[#3660A9]">
                      {patient.medications
                        .filter((med) => med.status === "CURRENT")
                        .map((med, index) => (
                          <li key={index}>
                            {med.name_and_reason}. Since {med.date}
                            <ion-icon name="arrow-redo-outline" 
                            style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                            onClick={() => copyTextToInput(`${med.name_and_reason} (Since ${med.date})`)}/>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>No current medications registered.</p>
                  )}

                  {/* Previous Medications */}
                  {patient.medications.filter((med) => med.status === "STOPPED").length > 0 && (
                    <div className="mt-4">
                      <span className="select-none font-bold text-lg text-[#3660A9]" onClick={() => toggleSection("previousMedications")}>
                        <ion-icon name={expandedSections.previousMedications ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px", cursor:"pointer" }}></ion-icon>Previous Medications</span>
                        <span className={`font-bold text-xl text-[#3660A9]`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: !isLoadingGlobal ? "pointer": "not-allowed"}} onClick={() => !isLoadingGlobal && handleSendCategory("Stopped Medications", patient.medications.filter((med) => med.status === "STOPPED") || "No data")}></ion-icon></span>

                      {expandedSections.previousMedications && (
                        <span className="break-words w-full mt-2">
                          <ul className="list-disc pl-5 marker:text-[#3660A9]">
                            {patient.medications
                              .filter((med) => med.status === "STOPPED")
                              .map((med, index) => (
                                <li key={index}>
                                  {med.name_and_reason}. Stopped on {med.date}
                                  <ion-icon name="arrow-redo-outline" 
                                    style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                    onClick={() => copyTextToInput(`${med.name_and_reason} (Stopped on ${med.date})`)}/>
                                </li>
                              ))}
                          </ul>
                        </span>
                      )}
                    </div>
                  )}
                </span>
              )}
            </div>

            {/*Imaging Studies*/}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("imagingStudies")}>
                <ion-icon name={expandedSections.imagingStudies ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{marginRight:"10px", cursor:"pointer"}}></ion-icon>Imaging Studies</span>
                <span className={`font-bold text-xl ${patient.imaging_studies.length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.imaging_studies.length > 0  && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.imaging_studies.length > 0  && !isLoadingGlobal && handleSendCategory("Imaging Studies", patient.imaging_studies || "No data")}></ion-icon></span>
              {expandedSections.imagingStudies && (
                <span className="break-words w-full mt-2">
                  {patient.imaging_studies && patient.imaging_studies.length > 0 ? (
                    <ul className="list-disc pl-5 marker:text-[#3660A9]">
                      {patient.imaging_studies.map((study, index) => (
                        <li key={index} className="mb-2">
                          [{study.date}] {study.description}
                          <ion-icon name="arrow-redo-outline" 
                            style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                            onClick={() => copyTextToInput(`${study.description} [${study.date}]`)}/>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No imaging studies recorded.</p>
                  )}
                </span>
              )}
            </div>


            {/*Emergency Contact*/}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("emergencyContacts")}>
                <ion-icon name={expandedSections.emergencyContacts ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{marginRight:"10px", cursor:"pointer"}}></ion-icon>Emergency Contacts<ion-icon name="warning-outline" style={{marginLeft:"5px", cursor:"pointer"}}></ion-icon>
              </span>
              {expandedSections.emergencyContacts && (
                <span className="break-words w-full mt-2">{patient.details.contact_emergency || "Not specified"}</span>
              )}
            </div>

            
          </div>
  
          {/* Gruppo 2 */}
          <div className="pl-4">

            {/* Active Care Plans */}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("carePlans")}>
                <ion-icon name={expandedSections.carePlans ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px", cursor:"pointer" }}></ion-icon>Active Care Plans</span>
                <span className={`font-bold text-xl ${patient.care_plans.filter((plan) => plan.date.includes("[CURRENT]")).length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.care_plans.filter((plan) => plan.date.includes("[CURRENT]")).length > 0 && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.care_plans.filter((plan) => plan.date.includes("[CURRENT]")).length > 0  && !isLoadingGlobal && handleSendCategory("Active Care Plans", patient.care_plans.filter((plan) => plan.date.includes("[CURRENT]")) || "No data")}></ion-icon></span>
              {expandedSections.carePlans && (
                <span className="break-words w-full mt-2">
                  {/* Active Care Plans */}
                  {patient.care_plans.filter((plan) => plan.date.includes("[CURRENT]")).length > 0 ? (
                    <ul className="list-disc pl-5 marker:text-[#3660A9]">
                      {patient.care_plans
                        .filter((plan) => plan.date.includes("[CURRENT]"))
                        .map((plan, index) => (
                          <li key={index} className="mb-2">
                            {plan.type && (
                              <p>
                                <strong className="text-[#2778A8]">Type:</strong> {plan.type}
                                <ion-icon name="arrow-redo-outline" 
                                  style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                  onClick={() => copyTextToInput(plan.type)}/>
                                
                              </p>
                            )}
                            {plan.reason && (
                              <p>
                                <strong className="text-[#2778A8]">Reason:</strong> {plan.reason}
                                <ion-icon name="arrow-redo-outline" 
                                  style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                  onClick={() => copyTextToInput(plan.reason)}/>
                              </p>
                            )}
                            {plan.activities && plan.activities.length > 0 && (
                              <>
                                <p>
                                  <strong className="text-[#2778A8]">Activities:
                                  <ion-icon name="arrow-redo-outline" 
                                    style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                    onClick={() => copyTextToInput(plan.activities)}/>
                                  </strong>
                                </p>
                                <ul className="list-disc pl-8 marker:text-[#3660A9]">
                                  {plan.activities.map((activity, idx) => (
                                    <li key={idx}>{activity}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p>No active care plans registered.</p>
                  )}

                  {/* Stopped Care Plans */}
                  {patient.care_plans.filter((plan) => plan.date.includes("[STOPPED]")).length > 0 && (
                    <div className="mt-4">
                      <span className="select-none font-bold text-lg text-[#3660A9]" onClick={() => toggleSection("stoppedCarePlans")}>
                        <ion-icon name={expandedSections.stoppedCarePlans ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px", cursor:"pointer" }}></ion-icon>Stopped Care Plans</span>
                        <span className={`font-bold text-xl text-[#3660A9]`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor:  !isLoadingGlobal ? "pointer" : "not-allowed" }} onClick={() => !isLoadingGlobal && handleSendCategory("Stopped Care Plans", patient.care_plans.filter((plan) => plan.date.includes("[STOPPED]")) || "No data")}></ion-icon></span>

                      {expandedSections.stoppedCarePlans && (
                        <span className="break-words w-full mt-2">
                          <ul className="list-disc pl-5 marker:text-[#3660A9]">
                            {patient.care_plans
                              .filter((plan) => plan.date.includes("[STOPPED]"))
                              .map((plan, index) => (
                                <li key={index} className="mb-2">
                                  {plan.type && (
                                    <p>
                                      <strong className="text-[#2778A8]">Type:</strong> {plan.type}
                                      <ion-icon name="arrow-redo-outline" 
                                        style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                        onClick={() => copyTextToInput(plan.type)}/>
                                    </p>
                                  )}
                                  {plan.reason && (
                                    <p>
                                      <strong className="text-[#2778A8]">Reason:</strong> {plan.reason}
                                      <ion-icon name="arrow-redo-outline" 
                                        style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                        onClick={() => copyTextToInput(plan.reason)}/>
                                    </p>
                                  )}
                                  {plan.activities && plan.activities.length > 0 && (
                                    <>
                                      <p>
                                        <strong className="text-[#2778A8]">Activities:
                                        <ion-icon name="arrow-redo-outline" 
                                          style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                          onClick={() => copyTextToInput(plan.activities)}/>
                                        </strong>
                                      </p>
                                      <ul className="list-disc pl-8 marker:text-[#3660A9]">
                                        {plan.activities.map((activity, idx) => (
                                          <li key={idx}>{activity}</li>
                                        ))}
                                      </ul>
                                    </>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </span>
                      )}
                    </div>
                  )}
                </span>
              )}
            </div>


            {/*Immunizations*/}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("immunizations")}>
                <ion-icon name={expandedSections.immunizations ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{marginRight:"10px", cursor:"pointer"}}></ion-icon>Immunizations</span>
                <span className={`font-bold text-xl ${patient.immunizations.length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.immunizations.length > 0 && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.immunizations.length > 0  && !isLoadingGlobal && handleSendCategory("Immunizations", patient.immunizations || "No data")}></ion-icon></span>
              {expandedSections.immunizations && (
              <span className="break-words w-full">
                {patient.immunizations && patient.immunizations.length > 0 ? (
                  <ul className="list-disc pl-5 marker:text-[#3660A9]">
                    {patient.immunizations.map((immunization, index) => (
                      <li key={index} className="mb-2">
                        <p>
                          <strong className="text-[#2778A8]">Vaccine:</strong> {immunization.vaccine} [{immunization.date}]
                          <ion-icon name="arrow-redo-outline" 
                            style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                            onClick={() => copyTextToInput(`${immunization.vaccine} [${immunization.date}]`)}/>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No immunizations registered.</p>
                )}
              </span>
              )}
            </div>

            {/* Reports */}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("reports")}>
                <ion-icon name={expandedSections.reports ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px", cursor:"pointer"}}></ion-icon>Reports</span>
                <span className={`font-bold text-xl ${patient.reports.length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.reports.length > 0 && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.reports.length > 0  && !isLoadingGlobal && handleSendCategory("Reports", patient.reports || "No data")}></ion-icon></span>

              {expandedSections.reports && (
                <span className="break-words w-full mt-2">
                  {patient.reports && patient.reports.length > 0 ? (
                    <ul className="list-disc pl-5 marker:text-[#3660A9]">
                      {patient.reports.map((report, index) => (
                        <li key={index} className="mb-2">
                          {/* Report Date and Type */}
                          <p>
                            <strong className="text-[#2778A8]">Date:</strong> {report.date}
                            <ion-icon name="arrow-redo-outline" 
                              style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                              onClick={() => copyTextToInput(report.date)}/>
                          </p>
                          <p>
                            <strong className="text-[#2778A8]">Type:</strong> {report.type}
                            <ion-icon name="arrow-redo-outline" 
                              style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                              onClick={() => copyTextToInput(report.type)}/>
                          </p>

                          {/* Report Details */}
                          {report.details && report.details.length > 0 && (
                            <>
                              <p>
                                <strong className="text-[#2778A8]">Details:</strong>
                                <ion-icon name="arrow-redo-outline" 
                                  style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                                  onClick={() => copyTextToInput(report.details)}/>
                              </p>
                              <ul className="list-disc pl-8 marker:text-[#3660A9]">
                                {report.details.map((detail, idx) => (
                                  <li key={idx}>{detail}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No reports registered.</p>
                  )}
                </span>
              )}
            </div>

            {/* Procedures */}
            <div className="flex items-start py-3 flex-wrap">
              <span className="select-none font-bold text-xl text-[#3660A9]" onClick={() => toggleSection("procedures")}>
                <ion-icon name={expandedSections.procedures ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px",cursor:"pointer" }}></ion-icon>Procedures History</span>
                <span className={`font-bold text-xl ${patient.procedures.length > 0  ? "text-[#3660A9]" : "text-gray-400"}`}><ion-icon name="chatbubble-ellipses-outline" style={{marginLeft: "5px", cursor: patient.procedures.length > 0 && !isLoadingGlobal ? "pointer" : "not-allowed", }} onClick={() => patient.procedures.length > 0  && !isLoadingGlobal && handleSendCategory("Procedures History", patient.prcoedures || "No data")}></ion-icon></span>

              {expandedSections.procedures && (
                <span className="break-words w-full mt-2">
                  {patient.procedures && patient.procedures.length > 0 ? (
                    <ul className="list-disc pl-5 marker:text-[#3660A9]">
                      {patient.procedures.map((procedure, index) => (
                        procedure.date && procedure.description ? ( // Verifica che esistano entrambi i campi
                          <li key={index} className="mb-2">
                            [{procedure.date}] {procedure.description}
                            <ion-icon name="arrow-redo-outline" 
                              style={{marginLeft: "3px",color: "#3660A9", cursor: patient.details.blood_type && !isLoadingGlobal ? "pointer" : "not-allowed"}} 
                              onClick={() => copyTextToInput(`${procedure.description} [${procedure.date}]`)}/>
                          </li>
                        ) : null
                      ))}
                    </ul>
                  ) : (
                    <p>No procedures registered.</p>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-start py-3 flex-wrap">
              <button
                className={`bg-[#3660A9] text-white text-md px-4 py-2 rounded shadow flex items-center ${
                isLoadingGlobal ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
                onClick={handleComprehensiveAnalysis}
                disabled={isLoadingGlobal}
              >
                Comprehensive Analysis
                <ion-icon name="chatbubble-ellipses-outline" style={{marginLeft:"10px", fontSize: "20px"}}></ion-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default GrigliaInfo;
  