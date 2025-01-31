import axios from "axios";

const API_URL = "http://localhost:5000";

//funzione per ottenre i dati del dottore dal login
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // Restituisce i dati del dottore
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message); // Restituisce il messaggio di errore dal backend
    }
    throw new Error("Something went wrong");
  }
};

// Funzione per ottenere il conteggio dei pazienti
export const getPatientCount = async (doctorEmail) => {
  try {
    const response = await axios.get(`${API_URL}/doctor/${doctorEmail}/patient-count`);
    return response.data.patient_count;
  } catch (error) {
    throw new Error("Failed to fetch patient count");
  }
};


// Funzione per ottenere i pazienti
export const getPatients = async (doctorEmail) => {
  try {
    const response = await axios.get(`${API_URL}/doctor/${doctorEmail}/patients`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch patients");
  }
};


// Funzione per chattare con mistra
export const sendMessageToChat = async (patientId, message) => {

  try {
    const response = await axios.post(`${API_URL}/api/chat`, {
      patient_id: patientId, // Cambiato da user_id a patient_id
      message: message,
    });
    return response.data.response; // Restituisci solo la risposta del modello
  } catch (error) {
    console.error("Errore nella comunicazione con il backend:", error);
    throw new Error(error.response?.data?.error || "Errore durante la richiesta");
  }
};

// Funzione per far analizzare una categoria
export const sendCategoryToLLM = async (patientId, categoryName, categoryText) => {
  try {
    const response = await axios.post(`${API_URL}/api/send-category`, {
      patient_id: patientId,
      category_name: categoryName,
      category_text: categoryText,
    });
    return response.data.response;
  } catch (error) {
    console.error("Errore durante la comunicazione con il backend:", error);
    throw new Error(error.response?.data?.error || "Errore durante la richiesta");
  }
};

// Funzione per far salvare chat nel db
export const saveChatToDatabase = async (chatFile) => {
  try {
    console.log(chatFile);

    const response = await axios.post(`${API_URL}/api/save-chat`, {
      patientId: chatFile.patientId,
      content: chatFile.content,
      createdAt: chatFile.createdAt,
    });
    return response.data; // Assumendo che il backend restituisca un oggetto { success: true/false }
  } catch (error) {
    console.error("Errore durante il salvataggio della chat:", error);
    throw new Error("Impossibile salvare la chat.");
  }
};

// Funzione per recuperare le cronologie della chat di un paziente
export const getChatHistories = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/api/chat-histories/${patientId}`);
    return response.data.histories; // Ritorna la lista dei file salvati
  } catch (error) {
    console.error("Errore durante il recupero delle cronologie della chat:", error);
    throw error;
  }
};

// Funzione per recuperare una chat salvata di un paziente
export const downloadChatFile = async (filename) => {
  try {
    const response = await axios.get(`${API_URL}/api/download-chat/${filename}`);
    return response.data.chat; // Ritorna la chat con il contenuto come array di messaggi
  } catch (error) {
    console.error("Errore durante il download del file:", error);
    throw error;
  }
};

// Funzione per recuperare una chat salvata di un paziente
export const deleteChatFile = async (filename) => {
  try {
    const response = await axios.delete(`${API_URL}/api/delete-chat/${filename}`);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'eliminazione del file:", error);
    throw error;
  }
};

// Funzione per l'analisi completa del paziente
export const getComprehensiveAnalysis = async (patientId) => {
  try {
    const response = await axios.post(`${API_URL}/api/comprehensive-analysis/${patientId}`);
    return response.data.response; // Restituisce solo la risposta generata dall'LLM
  } catch (error) {
    console.error("Errore durante l'analisi completa:", error);
    throw new Error(error.response?.data?.error || "Errore durante l'analisi completa");
  }
};

// Funzione per caricare un file per un paziente
export const uploadFile = async (patientId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/patients/${patientId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Funzione per ottenere i file di un paziente
export const getPatientFiles = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/files`);
    return response.data.files;
    
  } catch (error) {
    console.error("Error fetching patient files:", error);
    throw error;
  }
};

// Funzione per visualizzare un file specifico
export const viewFile = async (patientId, fileId) => {
  try {
    const url = `${API_URL}/patients/${patientId}/files/${fileId}`;
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error viewing file:", error);
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await axios.delete(`${API_URL}/files/${fileId}`);
    return response.data; // Restituisce la risposta del backend
  } catch (error) {
    console.error("Errore API:", error);
    throw error; // Lancia un'eccezione in caso di errore
  }
};


// Funzione per aggiornare tutti i dati del paziente
export const updatePatientDetails = async (patientId, updatedData) => {
  try {
    const sanitizedData = { ...updatedData };
    delete sanitizedData.chatFiles; // Non inviare chatFiles
    delete sanitizedData.details["doctor_mail"]; // Non modificare il doctor_mail

    const response = await axios.put(`${API_URL}/patients/${patientId}`, sanitizedData);
    return response.data;
  } catch (error) {
    console.error("Errore durante l'aggiornamento del paziente:", error);
    throw error;
  }
};

// Funzione per aggiungere un nuovo elemento in una lista specifica (es. Allergies)
export const addItemToList = async (patientId, listName, newItem) => {
  try {
    const response = await axios.post(
      `${API_URL}/patients/${patientId}/${listName}`,
      newItem
    );
    return response.data; // Restituisce l'elemento aggiunto dal backend
  } catch (error) {
    console.error(`Errore durante l'aggiunta a ${listName}:`, error);
    throw error;
  }
};

export const deleteItemFromList = async (patientId, listName, itemId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/patients/${patientId}/${listName}/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Errore durante la cancellazione da ${listName}:`, error);
    throw error;
  }
};

// Funzione per creare un nuovo paziente
export const createNewPatient = async (doctorEmail) => {
  try {
    const response = await axios.post(`${API_URL}/doctor/${encodeURIComponent(doctorEmail)}/createpatient`);
    
    return response.data; // Restituisce il nuovo paziente creato
  } catch (error) {
    console.error("Errore durante la creazione del nuovo paziente:", error.response?.data || error.message);
    throw error;
  }
};