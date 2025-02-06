import { getChatHistories, downloadChatFile,  deleteChatFile } from "../utils/api";
import { useEffect, useState } from "react";

function ChatHistory ({ patientId, loadChat }){
  const [chatHistories, setChatHistories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); // Stato per la tendina

  // Funzione per recuperare le cronologie
  const fetchHistories = async () => {
    try {
      const histories = await getChatHistories(patientId);
      setChatHistories(histories);
    } catch (error) {
      console.error("Errore durante il recupero delle cronologie:", error);
    }
  };


  useEffect(() => {
    if (patientId) {
      fetchHistories();
    }
  }, [patientId]);


  const handleLoadChat = async (filename) => {
    if (!filename) {
      console.error("Errore: filename non definito");
      return;
    }
    try {
      const chat = await downloadChatFile(filename);
      loadChat(chat.content); // Carica i messaggi nella chat
    } catch (error) {
      console.error("Errore durante il caricamento della chat:", error);
    }
  };

  const handleDeleteChat = async (filename) => {
    if (!filename) {
      console.error("Errore: filename non definito");
      return;
    }
  
    // Chiedi conferma all'utente
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat? The operation cannot be undone."
    );
  
    if (!confirmDelete) {
      return; // L'utente ha annullato l'operazione
    }
  
    try {
      await deleteChatFile(filename); // Chiama l'API per eliminare il file
      setChatHistories((prev) =>
        prev.filter((history) => history.filename !== filename)
      ); // Aggiorna la cronologia locale rimuovendo il file eliminato
    } catch (error) {
      console.error("Errore durante l'eliminazione della chat:", error);
    }
  };

  return (
    <div className="select-none w-wrap max-w-xl mt-4">
      <div
        className="flex items-start cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-bold text-xl text-[#3660A9] flex items-center">
          <ion-icon name={isExpanded ? "chevron-up-circle-outline" : "chevron-down-circle-outline"} style={{ marginRight: "10px", fontSize: "20px" }}></ion-icon>
          ChatHistory
          <ion-icon name="sync-outline" style={{ marginLeft: "3px", fontSize: "20px" }}  onClick={fetchHistories}></ion-icon>
        </span>
        
      </div>
      {isExpanded && (
        <div className="mt-2 w-wrap max-w-xl">
          {chatHistories.length > 0 ? (
            <ul className="list-disc pl-5 marker:text-[#3660A9]">
              {chatHistories.map((history, index) => (
                <li key={index} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className="truncate w-[70%] overflow-hidden text-black" title={history.filename}>
                      {history.filename}
                    </span>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleLoadChat(history.filename)}
                        className=" bg-[#3660A9] text-white px-2 py-1 rounded"
                      >
                        <ion-icon name="cloud-download-outline" style={{ fontSize: "18px" }}></ion-icon>
                      </button>
                      <button
                        onClick={() => handleDeleteChat(history.filename)}
                        className="ml-2 bg-[#DC3545] text-white px-2 py-1 rounded"
                      >
                        <ion-icon name="trash-outline" style={{ fontSize: "18px" }}></ion-icon>
                      </button>
                    </div>
                </div>
              </li>
              ))}
            </ul>
          ) : (
            <span className="text-black ml-8">No chat saved yet</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
