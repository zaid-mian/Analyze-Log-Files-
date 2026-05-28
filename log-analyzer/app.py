from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from flask_login import login_required, current_user
import os, json, io
from dotenv import load_dotenv
from mapreduce import run_mapreduce
from db import save_result, get_results, get_result_by_id, init_db
from ai_insights import get_ai_insights
from export_report import export_csv, export_pdf
from auth import auth_bp, login_manager, oauth

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-in-production")
CORS(app, supports_credentials=True)

login_manager.init_app(app)
oauth.init_app(app)

# Configure Google OAuth
app.config["GOOGLE_CLIENT_ID"] = os.environ.get("GOOGLE_CLIENT_ID", "")
app.config["GOOGLE_CLIENT_SECRET"] = os.environ.get("GOOGLE_CLIENT_SECRET", "")
app.config["GOOGLE_CLIENT_KWARGS"] = {
    "scope": "openid email profile"
}
app.config["GOOGLE_ACCESS_TOKEN_PARAMS"] = None
app.config["GOOGLE_ACCESS_TOKEN_URL"] = "https://oauth2.googleapis.com/token"
app.config["GOOGLE_AUTHORIZE_URL"] = "https://accounts.google.com/o/oauth2/v2/auth"
app.config["GOOGLE_API_BASE_URL"] = "https://www.googleapis.com/oauth2/v2/"
app.config["GOOGLE_CLIENT_USERINFO_ENDPOINT"] = "https://openidconnect.googleapis.com/v1/userinfo"

app.register_blueprint(auth_bp)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

with app.app_context():
    init_db()


@app.route("/")
def index():
    if current_user.is_authenticated:
        return render_template("index.html")
    return render_template("landing.html")


@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("index.html")


@app.route("/upload")
@login_required
def upload_page():
    return render_template("index.html")


@app.route("/api/auth/me")
def api_auth_me():
    if current_user.is_authenticated:
        return jsonify({
            "id": current_user.id,
            "email": getattr(current_user, "email", current_user.id),
            "picture": getattr(current_user, "picture", None)
        })
    return jsonify(None), 401


@app.route("/api/upload", methods=["POST"])
@login_required
def api_upload():
    if "logfile" not in request.files:
        return jsonify({"error": "No file selected"}), 400
    
    file = request.files["logfile"]
    if file.filename == "" or not (file.filename.endswith(".log") or file.filename.endswith(".csv")):
        return jsonify({"error": "Only .log or .csv files are accepted"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    result, benchmarks = run_mapreduce(filepath)
    insights = get_ai_insights(result, benchmarks, file.filename)
    result_id = save_result(file.filename, result, current_user.id, benchmarks, insights)
    
    return jsonify({"success": True, "result_id": result_id})


@app.route("/api/results")
@login_required
def api_get_results():
    results = get_results()
    out = []
    for r in results:
        out.append({
            "id": r["id"],
            "filename": r["filename"],
            "result": r["result"],
            "benchmarks": r["benchmarks"],
            "insights": r["insights"],
            "uploaded_by": r["uploaded_by"],
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        })
    return jsonify(out)


@app.route("/api/export/csv/<int:result_id>")
@login_required
def api_export_csv(result_id):
    try:
        row = get_result_by_id(result_id)
        if not row:
            return jsonify({"error": "Record not found"}), 404
        data = export_csv(row["result"], row["benchmarks"] or {}, row["filename"])
        return send_file(
            io.BytesIO(data),
            mimetype="text/csv",
            as_attachment=True,
            download_name=f"report_{row['filename']}.csv"
        )
    except Exception as e:
        print(f"CSV export error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/export/pdf/<int:result_id>")
@login_required
def api_export_pdf(result_id):
    try:
        row = get_result_by_id(result_id)
        if not row:
            return jsonify({"error": "Record not found"}), 404
        insights = row.get("insights") or []
        data = export_pdf(row["result"], row["benchmarks"] or {}, row["filename"], insights)
        return send_file(
            io.BytesIO(data),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"report_{row['filename']}.pdf"
        )
    except Exception as e:
        print(f"PDF export error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
