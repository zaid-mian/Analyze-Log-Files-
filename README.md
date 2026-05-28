# Analyze Log Files - Portfolio Project

A powerful log analyzer with a modern interface, built with Flask (backend) and React (frontend). This project showcases:

- MapReduce-based log processing for efficiency
- AI-powered insights using Gemini API
- Interactive data visualization
- Export to PDF and CSV
- User history and authentication

## Features

- **Log File Upload**: Supports both `.log` and `.csv` files
- **MapReduce Processing**: Efficient parallel log analysis
- **Interactive Dashboard**: Beautiful visualizations with Chart.js
- **AI Insights**: Gemini API-powered analysis of log data
- **Export Options**: Download reports as PDF or CSV
- **History Tracking**: View and access all previous log analysis sessions

## Tech Stack

- **Backend**: Flask, Python
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini API
- **PDF Export**: ReportLab
- **Data Visualization**: Chart.js

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn
- A Gemini API key (from Google AI Studio)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/zaid-mian/Analyze-Log-Files-.git
   cd Analyze-Log-Files-
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   # Create a .env file with your Gemini API key:
   echo "GEMINI_API_KEY=your-api-key-here" > .env
   python app.py
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the Application**:
   - Backend: http://127.0.0.1:5000
   - Frontend: http://localhost:5173

## Usage

1. Open the frontend in your browser
2. Log in with the default credentials (username: `admin`, password: `password`)
3. Upload a log or CSV file
4. View analysis and visualizations
5. Export your report if needed

## Security

- `.env` files and sensitive data are gitignored
- Never commit API keys or credentials
- Use environment variables for all configuration

## License

MIT License - feel free to use this for your portfolio!
