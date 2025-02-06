import { forwardRef, useImperativeHandle, useState } from "react";
import { sendMessageToChat, saveChatToDatabase } from "../utils/api";
import ChatHistory from "../components/ChatHistory";

const LlmInterface = forwardRef(({ patientId, isLoadingGlobal, setIsLoadingGlobal, inputRef, input, setInput }, ref) => {
  const [messages, setMessages] = useState([]);
  

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { sender: "User", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput(""); // Pulisci l'input
      setIsLoadingGlobal(true); // Imposta lo stato di caricamento


      try {
        const response = await sendMessageToChat(patientId, input); // Usa il patientId
        const assistantMessage = { sender: "Assistant", text: response };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Errore durante l'invio del messaggio:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "Assistant", text: "Errore: impossibile rispondere al momento." },
        ]);
      } finally {
        setIsLoadingGlobal(false); // Disabilita lo stato di caricamento
      }
    }
  };

 
  const addMessageToChat = (categoryName, response) => {
    setMessages((prev) => {
      // Se non c'è ancora una risposta, aggiungi solo il messaggio dell'utente e attiva il caricamento
      if (!response) {
        setIsLoadingGlobal(true); // Mostra la rotellina di caricamento
        return [...prev, { sender: "User", text: `${categoryName}` }];
      }
  
      // Se c'è una risposta, aggiungi il messaggio dell'assistente e disattiva il caricamento
      setIsLoadingGlobal(false); // Nascondi la rotellina
      return [...prev, { sender: "Assistant", text: response }];
    });
  };

  const loadChat = (chatContent) => {
    if (Array.isArray(chatContent)) {
      setMessages(chatContent); // Imposta i messaggi se è un array valido
    } else {
      console.error("Formato non valido per chatContent:", chatContent);
      setMessages([]); // Fallback per contenuti non validi
    }
  };

  useImperativeHandle(ref, () => ({
    addMessageToChat, //aggiunge messaggi alla chat
    resetMessages: () => setMessages([]), //pulisce la chat
  }));

  const normalizedText = (text) => {
    // Aggiungi un controllo per verificare se 'text' è una stringa valida
    if (typeof text !== 'string') {
      return ; // Se non è una stringa, restituisci una stringa vuota
    }
    
    return text
      .replace(/\t/g, " ") // Sostituisce le tabulazioni con uno spazio
      .replace(/ +/g, " ") // Riduce spazi multipli a uno solo
      .trim(); // Rimuove spazi iniziali e finali
  };

  const handleSaveChat = async () => {
    const doctorName = sessionStorage.getItem("doctorName") || "Unknown Doctor";
  
    const chatContent = messages
      .map((msg) =>
        `${msg.sender === "User" ? `Dr. ${doctorName}: ${msg.text}` : `mistral response: ${msg.text}`}`
      )
      .join("\n");
  
    const chatFile = {
      patientId,
      content: chatContent,
      createdAt: new Date().toISOString(),
    };
  
    try {
      const response = await saveChatToDatabase(chatFile);
      if (response.success) {
        alert("Chat salvata con successo!");
      } else {
        alert("Errore durante il salvataggio della chat.");
      }
    } catch (error) {
      console.error("Errore durante il salvataggio della chat:", error);
      alert("Errore durante il salvataggio della chat. Riprova più tardi.");
    }
  };
  

  return (
    <div className="max-w-4xl h-full bg-white shadow-lg rounded-lg p-6 pt-4 flex flex-col items-center overflow-hidden">
      <h2 className="select-none text-3xl text-[#3660A9] font-bold mb-4">Talk to Mistral</h2>
          <div className="flex gap-4 mb-4 mt-4">
          <button
            onClick={handleSaveChat}
            className={`bg-[#3660A9] text-white text-md px-4 py-2 rounded shadow flex items-center ${
              isLoadingGlobal || !messages.length > 0 ? "opacity-80 cursor-not-allowed" : ""
            }`}
            disabled={isLoadingGlobal || !messages.length > 0}
          >
            Save Chat
            <ion-icon name="bookmark-outline" style={{marginLeft:"10px", fontSize: "20px"}}></ion-icon>
          </button>

          <button
            onClick={() => setMessages([])} // Pulisce i messaggi
            className={`bg-[#3660A9] text-white text-md px-4 py-2 rounded shadow flex items-center ${
               !messages.length > 0 ? "opacity-80 cursor-not-allowed" : ""
            }`}
            disabled={ !messages.length > 0} // Disabilita durante il caricamento
            >
            New Chat
            <ion-icon name="create-outline" style={{ marginLeft: "10px", fontSize: "20px" }}></ion-icon>
            </button>
            </div>


      {/* Messaggi */}
      <div className="h-[605px] w-full max-w-xl p 5 bg-gray-100 rounded-lg " style={{ boxShadow: "inset 0 0 10px #3660A9" }}>
      <div className="h-[590px] w-wrap overflow-y-auto m-2 mb-2 mr-2 p-4 bg-gray-100 rounded-lg scrollbar scrollbar-thumb-[#3660A9] scrollbar-track-transparent"
        >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`${
                msg.sender === "User"
                  ? "bg-[#E3EDFB] text-[#1F4B73]"
                  : "bg-[#EAF7EA] text-[#3A6B3A]"
              } py-2 px-4 rounded-xl shadow whitespace-pre-wrap`}
            >
              {normalizedText(msg.text)}
            </div>
          </div>
        ))}

        {/* Caricamento */}
        {isLoadingGlobal && (
          <div className="flex justify-center items-center mt-4">
            <div className="flex flex-col items-center">
              <section>
                <div className="container">
                  <div className="content">
                    <div className="heart-rate">
                      <svg
                        xmlSpace="preserve"
                        viewBox="0 0 150 73"
                        height="73px"
                        width="150px"
                        y="0px"
                        x="0px"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.0"
                      >
                        <polyline
                          points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,
                  63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"
                          strokeMiterlimit="10"
                          strokeWidth="3"
                          stroke="#3660A9"
                          fill="none"
                        ></polyline>
                      </svg>

                      <div className="fade-in"></div>

                      <div className="fade-out"></div>
                    </div>
                  </div>
                </div>
              </section>
              <span className="text-[#3660A9] text-sm">Generating the response...</span>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Input e pulsante */}
      <div className="flex items-center mt-4 w-full max-w-xl">
        <textarea
        ref={inputRef}
        className="flex-grow text-black bg-gray-50 border border-[#3660A9] rounded-md focus:border-[#3660A9]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3660A9] transition-colors duration-300 pl-4 h-16 resize-none scrollbar scrollbar-thumb-[#3660A9] scrollbar-track-transparent"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault(); // Previene l'invio del messaggio
            setInput((prev) => prev + "\n"); // Aggiunge un ritorno a capo
            } else if (e.key === "Enter") {
            e.preventDefault(); // Previene il comportamento predefinito di `Enter`
            handleSendMessage(); // Invia il messaggio
            }
        }}
        placeholder="Type your message here..."
        disabled={isLoadingGlobal} // Disabilita l'input durante il caricamento
        rows={1} // Altezza iniziale del textarea
        />
        <button
          className={`ml-4 flex items-center justify-center ${
            isLoadingGlobal ? "bg-[#3660A9] opacity-80" : "bg-[#3660A9]"
          } rounded-full text-white px-4 py-1`}
          onClick={handleSendMessage}
          disabled={isLoadingGlobal}
        >
          <ion-icon name="arrow-up-outline"  style={{ fontSize: "24px" }}></ion-icon>
        </button>
      </div>

      <br></br>

      <ChatHistory
        patientId={patientId}
        loadChat={loadChat}
      ></ChatHistory>

    </div>
  );
});

export default LlmInterface;
