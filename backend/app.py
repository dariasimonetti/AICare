from flask import Flask
from flask_cors import CORS
from routes.routes import auth_bp
from pymongo import MongoClient
from dotenv import load_dotenv
from llama_cpp import Llama
from flask_cors import CORS
import os


load_dotenv()

app = Flask(__name__)
CORS(app)

CORS(app, resources={r"/*": {"origins": "*"}})
CORS(auth_bp)

# Connessione a MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['AICare']

# Caricamento di mistral
model_path = "./model/mistral-7b-openorca.Q8_0.gguf"
model = Llama(model_path=model_path, n_ctx=4096)

# Test della connessione
"""
@app.route('/api/test', methods=['GET'])
def test_connection():
    try:
        collection = db['Patients']  # Nome corretto della collezione
        # Cerca un documento specifico con `_id`
        data = collection.find_one({"_id": ObjectId('678b80b2e998ba412b183922')})

        if data:
            # Converti `_id` in stringa per renderlo JSON-friendly
            data['_id'] = str(data['_id'])
            return {"data": data}, 200
        else:
            return {"error": "Document not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500
"""

# Registra il blueprint
auth_bp.db = db  # Passa l'istanza del database al blueprint
auth_bp.model = model
app.register_blueprint(auth_bp, url_prefix="/")  # Aggiunge un prefisso alle route di autenticazione

if __name__ == "__main__":
    app.run(debug=True)
