# 💊 Prescription NER Extractor

An AI-powered clinical web application that extracts structured medical data — **Medicine name**, **Dosage**, **Frequency**, and **Duration** — from unstructured prescription text using a **custom-trained spaCy Named Entity Recognition (NER) model**.

---

## 📌 Problem Statement

Doctors frequently write prescriptions in unstructured shorthand (e.g., *"Tab. Dolo 650mg BD x 5 days"* or *"Cap. Amoxicillin 500mg TDS for 7 days after meals"*). This makes manual entry into pharmacy systems and Electronic Health Records (EHR) slow and prone to errors.

**Prescription NER Extractor** automates this by parsing clinical text and returning standardized, structured medical entities ready to be analyzed, stored, or queried.

---

## ✨ Key Features

- 🔍 **Clinical Entity Extraction**: Accurately isolates `MEDICINE`, `DOSAGE`, `FREQUENCY`, and `DURATION`.
- 🧠 **Custom-Trained spaCy NER**: Tailored specifically on prescription and drug datasets (F1 ≈ 98.5%).
- 🌐 **Modern Clinical Web UI**: React 19 + Vite dashboard featuring glassmorphic dark theme, interactive color-coded entity badges, and one-click presets.
- 🔐 **Authentication & History**: Express API with JWT authentication, user accounts, and MongoDB persistence.
- ⚡ **Dual Microservice Architecture**: Decoupled Python FastAPI ML inference service and Node.js business backend.
- 📊 **Export Options**: Copy results, export structured JSON, or download formatted prescription reports.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **AI / NLP** | Python, spaCy | Custom-trained Clinical NER model |
| **ML Microservice** | FastAPI, Uvicorn, Pydantic | High-performance async inference engine (`:8001`) |
| **Backend API** | Node.js, Express, Mongoose | Auth, prescription history, and proxy orchestrator (`:5000`) |
| **Database** | MongoDB | Document store for users and clinical extractions (`:27017`) |
| **Frontend** | React 19, Vite, Lucide Icons | Responsive clinical dashboard (`:3000`) |
| **Version Control** | Git & GitHub | Collaborative development |

---

## 👥 Team Members

| Name | Role |
|---|---|
| **Ansh Rajput** | NER Model Training & Full Stack Integration |
| **Alok Mishra** | Data Collection & Clinical Annotation |
| **Amrithanshu Chaudhary** | Backend Development |
| **Ankit Kumar Gautam** | Frontend Development |

---

## 📁 Project Structure

```text
prescription-ner-extractor/
├── ml_service/                 # Python FastAPI ML Microservice (Port 8001)
│   ├── app.py                  # FastAPI server (/health, /extract endpoints)
│   ├── extractor.py            # spaCy NER inference pipeline wrapper
│   ├── schemas.py              # Pydantic data models
│   └── requirements.txt        # ML dependencies
├── backend/                    # Node.js Express API (Port 5000)
│   ├── server.js               # Express application entry point
│   ├── config/db.js            # MongoDB connection with auto-retry
│   ├── models/                 # Mongoose models (User.js, Prescription.js)
│   ├── routes/                 # Routes (auth.js, prescriptions.js, admin.js)
│   ├── middleware/             # JWT auth & role guards
│   ├── package.json            # Node backend dependencies
│   └── .env.example            # Environment variables template
├── frontend/                   # React 19 + Vite Dashboard (Port 3000)
│   ├── src/
│   │   ├── components/         # Header, EntityViewer, PrescriptionInput, HistoryDrawer, AuthModal
│   │   ├── services/api.js     # Axios API service with JWT interceptor
│   │   ├── App.jsx             # Main interactive application
│   │   └── index.css           # Modern clinical design system
│   ├── vite.config.js          # Vite configuration with /api proxy
│   └── package.json            # Frontend dependencies
├── model/                      # Custom-trained spaCy model directory
├── data/                       # Prescriptions corpus & medical wordlists
├── notebooks/                  # Model training and validation notebooks
├── start-all.bat               # 1-Click launcher script for Windows
└── README.md
```

---

## 🏗️ Architecture & Data Flow

```text
[ React Frontend (:3000) ]
         │
         │  POST /api/prescriptions (with JWT)
         ▼
[ Express API Backend (:5000) ] ──── saves record ────► [ MongoDB (:27017) ]
         │
         │  POST /extract (raw text)
         ▼
[ FastAPI ML Microservice (:8001) ]
         │
         ▼
[ Custom spaCy NER Pipeline ] ──► Returns MEDICINE, DOSAGE, FREQUENCY, DURATION
```

---

## 🚀 Setup & Running Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **MongoDB Community Server** (installed locally)

### Option 1: One-Click Windows Launch
Simply double-click `start-all.bat` or run:
```cmd
start-all.bat
```
This automatically verifies MongoDB, starts the ML microservice (`:8001`), Express backend (`:5000`), and React frontend (`:3000`).

---

### Option 2: Manual Step-by-Step

#### 1. Start MongoDB
Ensure MongoDB is running locally on port 27017:
```cmd
mongod --dbpath data/db --setParameter diagnosticDataCollectionEnabled=false
```

#### 2. Start ML Microservice (FastAPI)
```bash
# In the project root
python -m venv venv
venv\Scripts\activate
pip install -r ml_service/requirements.txt

# Run FastAPI server on port 8001
cd ml_service
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

#### 3. Start Node.js Backend API
```bash
cd backend
npm install
copy .env.example .env   # On Windows (or cp on macOS/Linux)
npm run dev              # Runs on http://localhost:5000
```

#### 4. Start React Frontend
```bash
cd frontend
npm install
npm run dev              # Runs on http://localhost:3000
```

Open your browser at **http://localhost:3000**.

---

## 📡 API Reference

### Express API (`http://localhost:5000`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create user account |
| `POST` | `/api/auth/login` | User login & JWT issuance |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `POST` | `/api/prescriptions` | Extract entities via ML and persist to MongoDB |
| `GET` | `/api/prescriptions` | Paginated history of user prescriptions |
| `GET` | `/api/prescriptions/:id` | Fetch single prescription |
| `DELETE` | `/api/prescriptions/:id` | Delete saved prescription |

### ML Microservice (`http://localhost:8001`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Microservice health & loaded NER model labels |
| `POST` | `/extract` | Direct prescription entity extraction |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## 📈 Model Evaluation

The spaCy NER model was trained using custom clinical prescription annotations and evaluated across test samples:

- **Entity Labels**: `MEDICINE`, `DOSAGE`, `FREQUENCY`, `DURATION`
- **Model Pipeline**: `tok2vec` + `ner`
- **Precision**: 98.4%
- **Recall**: 98.6%
- **Overall F1-Score**: ~98.5%

---

## 🔮 Future Scope

- 📷 **OCR Integration**: Direct image/photo upload of handwritten prescriptions using Tesseract / Vision models.
- 🌐 **Multilingual Support**: Support Hindi and regional prescription notations.
- 🏥 **HL7 / FHIR Integration**: Standard healthcare export for hospital EHR integration.
- ☁️ **Cloud Deployment**: Containerized deployment with Docker and Kubernetes.

---

## 📄 License

Developed as part of a B.Tech academic project at **KIET Group of Institutions**.
