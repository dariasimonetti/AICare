from flask import Response, Blueprint, send_file, request, jsonify
from werkzeug.security import check_password_hash
from bson.objectid import ObjectId
from gridfs import GridFS
from flask import send_file
from io import BytesIO
import base64
import io
import datetime
import tiktoken

auth_bp = Blueprint("auth", __name__)  # Crea un blueprint per le route di autenticazione



#Login del medico
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        
        doctors_collection = auth_bp.db["doctors"]
        doctor = doctors_collection.find_one({"email": email})

        if not doctor:
            return jsonify({"message": "User not found"}), 404
        
        if not check_password_hash(doctor["password"], password):
            return jsonify({"message": "Incorrect password"}), 401

        return jsonify({
            "message": "Login successful",
            "doctor_id": str(doctor["_id"]),
            "name": doctor["name"],  
            "surname": doctor["surname"],  
            "workplace": doctor["workplace"]  
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route per ottenere il numero di pazienti associati a un dottore
@auth_bp.route("/doctor/<email>/patient-count", methods=["GET"])
def get_patient_count(email):
    try:
        patients_collection = auth_bp.db["Patients"]
        patient_count = patients_collection.count_documents({"details.doctor_mail": email})
        

        return jsonify({"patient_count": patient_count}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#Route per ottenere i pazienti associati al medico
@auth_bp.route("/doctor/<email>/patients", methods=["GET"])
def get_patients(email):
    try:
        patients_collection = auth_bp.db["Patients"]
        patients = list(patients_collection.find({"details.doctor_mail": email}))
        
        for patient in patients:
            patient["_id"] = str(patient["_id"])

        return jsonify(patients), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Mantieni una cronologia delle conversazioni (usa un dizionario per più utenti)
chat_histories = {}
tokenizer = tiktoken.get_encoding("cl100k_base")

def calculate_tokens(text):
    return len(tokenizer.encode(text))

#Route per scambiare messaggi semplici con mistra
@auth_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        patient_id = data.get('patient_id', 'default')
        user_message = data.get('message')
        print("id paziente; ", patient_id)

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Inizializzazione chat history se non esiste
        if patient_id not in chat_histories:
            chat_histories[patient_id] = []

        # Aggiunta messaggio utente alla cronologia
        chat_histories[patient_id].append(f"User: {user_message}")

        # Calcolo dei token
        conversation_context = "\n".join(chat_histories[patient_id])
        while calculate_tokens(conversation_context) > 2000:
            chat_histories[patient_id].pop(0)  # Rimuove il messaggio più vecchio
            conversation_context = "\n".join(chat_histories[patient_id])

        patients_collection = auth_bp.db["Patients"]
        
        patient = patients_collection.find_one({"_id": ObjectId(patient_id)})

        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        details = []

        # Aggiungi le informazioni solo se presenti
        if patient['details'].get('name'):
            details.append(f"\nName: {patient['details']['name']}")
        if patient['details'].get('age'):
            details.append(f"\nAge: {patient['details']['age']}")
        if patient['details'].get('gender'):
            details.append(f"\nGender: {patient['details']['gender']}")

        patient_details = "\n".join(details)

        # Aggiungi un'introduzione fissa al contesto
        introduction = f"""
        You are an assistant to a medical doctor. Your task is to help with patient data analysis, summarization, and answering questions in a precise and professional manner. Provide responses suitable for a clinical setting.

        Patient Demnographic dataData:
        {patient_details}
        """
        
        # Combina l'introduzione con la cronologia
        conversation_context = introduction.strip() + "\n" + conversation_context

        # Append prompt
        conversation_context += "\nAssistant: Respond in a complete and detailed manner, avoiding unnecessary repetitions."

        # Log del contesto della conversazione
        print("Conversation Context:", conversation_context)

        # Generazione risposta
        response = auth_bp.model(
            conversation_context,
            max_tokens=2048,
            stop=["User:", "Assistant:"],
            temperature=0.7
        )

        # Estrazione risposta
        bot_response = response['choices'][0]['text'].strip()
        print("Generated Response:", bot_response)

        # Aggiunta risposta alla cronologia
        chat_histories[patient_id].append(f"Assistant: {bot_response}")

        # Return response
        return jsonify({"response": bot_response}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500



#Route per far analizzare categoria a mistra
@auth_bp.route('/api/send-category', methods=['POST'])
def send_category_to_llm():
    try:
        data = request.json
        patient_id = data.get('patient_id')
        category_name = data.get('category_name')  # Nome della categoria
        category_text = data.get('category_text')  # Contenuto della categoria

        if not patient_id or not category_name or not category_text:
            return jsonify({"error": "patient_id, category_name, and category_text are required"}), 400

        # Recupera i dati anagrafici del paziente
        patients_collection = auth_bp.db["Patients"]
        patient = patients_collection.find_one({"_id": ObjectId(patient_id)})

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Dati anagrafici del paziente
        patient_details = f"""
        Name: {patient['details'].get('name', 'N/A')}
        Age: {patient['details'].get('age', 'N/A')}
        Gender: {patient['details'].get('gender', 'N/A')}
        """

        # Costruisci il contesto specifico per il task
        conversation_context = f"""
        You are an assistant helping a doctor analyze patient data. 
        Below is the patient's demographic information and the category data to analyze.
        If there are missing details or data not provided, clearly state "Data not available" and do not assume or invent information, avoid unnecessary repetitions.

        {patient_details}

        Task: Provide a detailed summary and analysis of the patient's {category_name}.
        Content: {category_text}

        Assistant: Respond in a complete and detailed manner, avoiding unnecessary repetitions.
        """

        # Genera risposta
        response = auth_bp.model(
            conversation_context.strip(),
            max_tokens=2048,
            stop=["User:", "Assistant:"],
            temperature=0.7
        )

        # Estrai risposta
        bot_response = response['choices'][0]['text'].strip()

        # Aggiungi alla cronologia
        if patient_id not in chat_histories:
            chat_histories[patient_id] = []
        chat_histories[patient_id].append(f"User: {category_name}: {category_text}")
        chat_histories[patient_id].append(f"Assistant: {bot_response}")

        return jsonify({"response": bot_response}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route per salvare la chat nel database
@auth_bp.route('/api/save-chat', methods=['POST'])
def save_chat():
    data = request.json
    patient_id = data.get('patientId')
    content = data.get('content')  # Lista dei messaggi come JSON
    created_at = data.get('createdAt')

    if not patient_id or not content or not created_at:
        return jsonify({"error": "Invalid request"}), 400

    try:
        db = auth_bp.db
        # Recupera il nome del paziente utilizzando il patient_id
        patients_collection = db["Patients"]
        patient = patients_collection.find_one({"_id": ObjectId(patient_id)}, {"details.name": 1})
        
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        patient_name = patient["details"]["name"]

        # Salva la chat come JSON nel database
        chat_entry = {
            "patient_id": patient_id,
            "content": content,
            "created_at": created_at,
            "filename": f"chat_{patient_name}_{created_at.replace(':', '').replace('-', '').replace('.', '')}.json"
        }

        result = patients_collection.update_one(
            {"_id": ObjectId(patient_id)},
            {"$push": {"chatFiles": chat_entry}}
        )

        if result.modified_count > 0:
            return jsonify({"success": True, "chat": chat_entry}), 200
        else:
            return jsonify({"error": "Patient not found"}), 404
    except Exception as e:
        print("Errore nel salvataggio:", str(e))
        return jsonify({"error": str(e)}), 500


#Route per avere le chat salvate nel db
@auth_bp.route('/api/chat-histories/<patientId>', methods=['GET'])
def get_chat_histories(patientId):
    try:
        patients_collection = auth_bp.db["Patients"]
        patient = patients_collection.find_one({"_id": ObjectId(patientId)})

        if not patient or "chatFiles" not in patient:
            return jsonify({"histories": []}), 200  # Nessuna cronologia trovata

        # Restituisci solo le informazioni sui file
        histories = patient["chatFiles"]
        return jsonify({"histories": histories}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#Route per scaricare dal db una chat salvata
@auth_bp.route('/api/download-chat/<filename>', methods=['GET'])
def download_chat(filename):
    try:
        patients_collection = auth_bp.db["Patients"]

        # Cerca la chat specifica nel database usando il filename
        patient = patients_collection.find_one(
            {"chatFiles.filename": filename},
            {"chatFiles.$": 1}  # Restituisce solo l'elemento specifico nella lista
        )

        if not patient or not patient.get("chatFiles"):
            return jsonify({"error": "Chat not found"}), 404

        chat = patient["chatFiles"][0]

        # Converte il contenuto in un array di messaggi
        content = chat["content"].split("\n")
        parsed_content = []
        current_message = None

        for line in content:
            line = line.strip()  # Rimuove spazi iniziali e finali
            if line.startswith("Dr.") or line.startswith("User:"):
                # Salva il messaggio corrente se esiste
                if current_message:
                    parsed_content.append(current_message)
                    current_message = None
                # Aggiunge il messaggio dell'utente
                parsed_content.append({"sender": "User", "text": line})
            elif line.startswith("mistral response:") or line.startswith("Assistant:"):
                # Salva il messaggio corrente se esiste
                if current_message:
                    parsed_content.append(current_message)
                # Inizia un nuovo messaggio per `mistral`
                current_message = {"sender": "Assistant", "text": line.replace("mistral response: ", "").strip()}
            elif current_message:
                # Aggiunge il testo al messaggio corrente
                current_message["text"] += f" {line}"
            elif line:
                # Linee extra che non appartengono a `Dr.` o `mistral` (fallback)
                parsed_content.append({"sender": "Assistant", "text": line})

        # Salva l'ultimo messaggio corrente se esiste
        if current_message:
            parsed_content.append(current_message)

        # Aggiorna il contenuto della chat
        chat["content"] = parsed_content

        # Aggiungi i messaggi scaricati a chat_histories per il patient_id
        patient_id = chat.get("patient_id", "default")
        if patient_id not in chat_histories:
            chat_histories[patient_id] = []

        # Converti `parsed_content` in un formato testuale compatibile con il contesto di chat_histories
        for message in parsed_content:
            sender = "User" if message["sender"] == "User" else "Assistant"
            chat_histories[patient_id].append(f"{sender}: {message['text']}")

        print(f"Chat history aggiornata per il paziente {patient_id}: {chat_histories[patient_id]}")

        return jsonify({"chat": chat}), 200
    except Exception as e:
        print("Errore durante il download della chat:", str(e))
        return jsonify({"error": str(e)}), 500

#Route per eliminare un file dal db
@auth_bp.route('/api/delete-chat/<filename>', methods=['DELETE'])
def delete_chat(filename):
    try:
        patients_collection = auth_bp.db["Patients"]

        # Trova il paziente con il file specificato
        patient = patients_collection.find_one(
            {"chatFiles.filename": filename}
        )

        if not patient:
            return jsonify({"error": "Chat not found"}), 404

        # Rimuovi il file dalla lista chatFiles
        result = patients_collection.update_one(
            {"_id": patient["_id"]},
            {"$pull": {"chatFiles": {"filename": filename}}}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Chat eliminata con successo"}), 200
        else:
            return jsonify({"error": "Nessuna modifica effettuata"}), 400
    except Exception as e:
        print("Errore durante l'eliminazione della chat:", str(e))
        return jsonify({"error": str(e)}), 500


# Route per l'analisi completa del paziente
@auth_bp.route('/api/comprehensive-analysis/<patient_id>', methods=['POST'])
def comprehensive_analysis(patient_id):
    try:
        patients_collection = auth_bp.db["Patients"]

        # Recupera i dati del paziente dal database
        patient = patients_collection.find_one({"_id": ObjectId(patient_id)})

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        details = []

        # Aggiungi le informazioni solo se presenti
        if patient['details'].get('name'):
            details.append(f"\nName: {patient['details']['name']}")
        if patient['details'].get('age'):
            details.append(f"\nAge: {patient['details']['age']}")
        if patient['details'].get('gender'):
            details.append(f"\nGender: {patient['details']['gender']}")
        if patient['details'].get('blood_type'):
            details.append(f"\nBlood Type: {patient['details']['blood_type']}")

        if patient.get('allergies'):
            allergies = ', '.join([allergy['description'] for allergy in patient['allergies']])
            if allergies:
                details.append(f"\nAllergies: {allergies}")

        if patient.get('medications'):
            current_medications = ', '.join([f"{med['name_and_reason']} (Since {med['date']})" for med in patient['medications'] if med.get('status') == 'CURRENT'])
            if current_medications:
                details.append(f"\nCurrent Medications: {current_medications}")

        if patient.get('imaging_studies'):
            imaging_studies = ', '.join([f"{study['description']} ({study['date']})" for study in patient['imaging_studies']])
            if imaging_studies:
                details.append(f"\nImaging Studies: {imaging_studies}")

        if patient.get('care_plans'):
            current_care_plans = [
                {
                    "date": plan['date'],
                    "type": plan['type'],
                    "reason": plan.get('reason', 'No reason specified'),
                    "activities": plan.get('activities', [])
                }
                for plan in patient['care_plans']
                if '[CURRENT]' in plan['date']
            ]

            if current_care_plans:
                # Formatta ogni piano di cura in modo leggibile
                care_plans_details = "\n".join([
                    f"- Type: {plan['type']}\t  Date: {plan['date']}\t  Reason: {plan['reason']}\t  Activities: {', '.join(plan['activities']) if plan['activities'] else 'None'}"
                    for plan in current_care_plans
                ])
                details.append(f"\nCare Plans:\n{care_plans_details}")

        if patient.get('procedures'):
            procedures = ', '.join([f"{proc['description']} ({proc['date']})" for proc in patient['procedures']])
            if procedures:
                details.append(f"\nProcedures: {procedures}")

        if patient.get('immunizations'):
            procedures = ', '.join([f"{imm['vaccine']} ({imm['date']})" for imm in patient['immunizations']])
            if procedures:
                details.append(f"\nProcedures: {procedures}")

        if patient.get('reports'):
            report_details = "\n".join([
                f"- Date: {report['date']}\t  Type: {report['type']}\t  Details: {', '.join(report['details']) if report.get('details') else 'No details available'}"
                for report in patient['reports']
            ])
            details.append(f"\nReports:\n{report_details}")


        # Combina tutti i dettagli in una stringa con indentazione
        patient_details = "\n".join(details)


        # Introduzione fissa per l'analisi
        introduction = """
        You are an assistant to a medical doctor. Your task is to analyze patient data, summarize the most important information, and provide a brief overview of the patient's general health condition. Provide recommendations if applicable.
        """

        prompt = f"""
        {introduction}

        Patient Data:
        {patient_details}

        Assistant: Provide a concise summary of the patient's clinical history, highlight key details, and assess the general health condition.
        """
        if patient_id not in chat_histories:
            chat_histories[patient_id] = []
        chat_histories[patient_id].append(f"User: Comprehensive Analysis Request")

        token_count = calculate_tokens(prompt)
        print(f"Token count for the input: {token_count}") 

        # Generazione risposta
        response = auth_bp.model(
            prompt.strip(),
            max_tokens=2048,
            stop=["User:", "Assistant:"],
            temperature=0.7
        )

        # Estrai la risposta generata
        bot_response = response['choices'][0]['text'].strip()

        # Aggiungi la risposta alla cronologia
        chat_histories[patient_id].append(f"Assistant: {bot_response}")

        return jsonify({"response": bot_response}), 200

    except Exception as e:
        print("Errore durante l'analisi completa:", str(e))
        return jsonify({"error": str(e)}), 500


# Route per il caricamento di un file
@auth_bp.route("/patients/<patient_id>/files", methods=["POST"])
def upload_file(patient_id):
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file provided"}), 400

        # Consentire solo file txt o pdf
        if file.mimetype not in ["text/plain", "application/pdf"]:
            return jsonify({"error": "Only .txt and .pdf files are allowed"}), 400

        fs = GridFS(auth_bp.db)
        file_id = fs.put(file, filename=file.filename, patient_id=patient_id, content_type=file.mimetype)

        return jsonify({"message": "File uploaded successfully", "file_id": str(file_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/patients/<patient_id>/files", methods=["GET"])
def get_files(patient_id):
    try:
        fs = GridFS(auth_bp.db)
        # Cerca il campo `patient_id` direttamente nel documento radice
        files = fs.find({"patient_id": patient_id})

        file_list = []
        for file in files:
            file_list.append({
                "file_id": str(file._id),
                "filename": file.filename,
                "content_type": file.contentType  # Nota che il campo è `contentType`, non `content_type`
            })

        return jsonify({"files": file_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Route per visualizzare un file specifico
@auth_bp.route("/patients/<patient_id>/files/<file_id>", methods=["GET"])
def view_file(patient_id, file_id):
    try:
        fs = GridFS(auth_bp.db)
        file = fs.get(ObjectId(file_id))

        if not file:
            return jsonify({"error": "File not found"}), 404

        # Restituisci il file per la visualizzazione
        return send_file(
            BytesIO(file.read()),  # Leggi i contenuti del file
            download_name=file.filename,  # Usa `download_name` invece di `attachment_filename`
            mimetype=file.contentType,  # Specifica il tipo MIME del file
            as_attachment=False  # Apri il file nel browser anziché scaricarlo
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@auth_bp.route("/files/<file_id>", methods=["DELETE"])
def delete_file(file_id):
    try:
        print(f"Ricevuto file_id: {file_id}")  # Debug: Log dell'ID ricevuto
        fs = GridFS(auth_bp.db)
        
        # Verifica se il file esiste prima di eliminarlo
        file_to_delete = fs.find_one({"_id": ObjectId(file_id)})
        if not file_to_delete:
            return jsonify({"error": "File non trovato"}), 404

        fs.delete(ObjectId(file_id))
        return jsonify({"message": "File eliminato con successo"}), 200
    except Exception as e:
        print(f"Errore durante l'eliminazione del file: {str(e)}")  # Debug
        return jsonify({"error": str(e)}), 500
    

@auth_bp.route("/patients/<patientId>", methods=["PUT"])
def update_patient_data(patientId):
    try:
        data = request.json
        patients_collection = auth_bp.db["Patients"]

        # Recupera il paziente esistente
        existing_patient = patients_collection.find_one({"_id": ObjectId(patientId)})
        if not existing_patient:
            return jsonify({"success": False, "message": "Patient not found"}), 404

        # Mantieni chatFiles e doctor_mail invariati
        data["chatFiles"] = existing_patient.get("chatFiles", [])
        data["details"]["doctor_mail"] = existing_patient["details"].get("doctor_mail")

        # Rimuovi il campo `_id` dal payload se presente
        if "_id" in data:
            del data["_id"]

        # Aggiorna il paziente
        result = patients_collection.update_one({"_id": ObjectId(patientId)}, {"$set": data})
        if result.modified_count == 0:
            return jsonify({"success": False, "message": "No updates made"}), 400

        return jsonify({"success": True, "message": "Patient updated successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@auth_bp.route("/patients/<patientId>/<listName>", methods=["POST"])
def add_to_list(patientId, listName):
    data = request.json.get("item")
    patients_collection = auth_bp.db["Patients"]
    patients_collection.update_one({"_id": ObjectId(patientId)}, {"$push": {listName: data}})
    return jsonify({"success": True, "message": "Item added successfully"}), 200



@auth_bp.route("/patients/<patientId>/<listName>/<index>", methods=["DELETE"])
def delete_from_list(patientId, listName, index):
    try:
        # Verifica che l'indice sia un numero intero
        if not index.isdigit():
            return jsonify({"error": "Invalid index"}), 400

        index = int(index)  # Converti l'indice in un intero
        patients_collection = auth_bp.db["Patients"]
        
        # Rimuove l'elemento specifico
        patients_collection.update_one(
            {"_id": ObjectId(patientId)},
            {"$unset": {f"{listName}.{index}": 1}}
        )
        # Elimina eventuali valori `None` risultanti
        patients_collection.update_one(
            {"_id": ObjectId(patientId)},
            {"$pull": {listName: None}}
        )
        return jsonify({"success": True, "message": "Item deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@auth_bp.route("/doctor/<email>/createpatient", methods=["POST"])
def create_patient(email):
    try:
        patients_collection = auth_bp.db["Patients"]

        # Crea un nuovo paziente con solo il dottore assegnato e un ID generato automaticamente
        new_patient = {
            "details": {
                "doctor_mail": email,
                "name": "",
                "age": "",
                "gender": "",
                "birth_date": "",
                "marital_status": "",
                "mail": "",
                "phone": "",
                "blood_type": "",
                "location": "",
                "contact_emergency": ""
            },
            "allergies": [],
            "medications": [],
            "conditions": [],
            "care_plans": [],
            "imaging_studies": [],
            "immunizations": [],
            "reports": [],
            "procedures": [],
            "chatFiles": []
        }

        # Inserisci il paziente nel database
        result = patients_collection.insert_one(new_patient)

        # Aggiungi l'ID generato al nuovo paziente e restituiscilo
        new_patient["_id"] = str(result.inserted_id)

        return jsonify(new_patient), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500