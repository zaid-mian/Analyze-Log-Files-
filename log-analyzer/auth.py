"""
Auth / IAM Module
Provides login, logout, and user-loading for Flask-Login.
In production, replace USERS dict with a proper DB-backed user table.
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from authlib.integrations.flask_client import OAuth
import os

auth_bp = Blueprint("auth", __name__)
login_manager = LoginManager()
login_manager.login_view = "auth.login"
login_manager.login_message = "Please log in to access the dashboard."
login_manager.login_message_category = "error"

oauth = OAuth()

# ── Hardcoded admin accounts (replace with DB in production) ──────────────────
USERS = {
    "admin": {"password": "admin123", "role": "admin"},
}


class User(UserMixin):
    def __init__(self, user_id, role="admin", email=None, picture=None):
        self.id = user_id
        self.role = role
        self.email = email
        self.picture = picture


@login_manager.user_loader
def load_user(user_id):
    if user_id in USERS:
        return User(user_id, USERS[user_id]["role"])
    return User(user_id, "user")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        
        print("DEBUG login attempt: username=", username)
        print("DEBUG USERS=", USERS)
        print("DEBUG password from request length=", len(password))
        if USERS.get(username):
            print("DEBUG password from db length=", len(USERS[username]["password"]))
        
        user_data = USERS.get(username)
        if user_data:
            print("DEBUG user_data exists")
            print("DEBUG user data password match?", user_data["password"] == password)
        
        if user_data and user_data["password"] == password:
            user = User(username, user_data["role"])
            login_user(user)
            if request.accept_mimetypes.best == 'application/json':
                return jsonify({
                    "id": user.id,
                    "email": getattr(user, "email", user.id),
                    "picture": getattr(user, "picture", None)
                })
            next_page = request.args.get("next")
            return redirect(next_page or url_for("dashboard"))
        else:
            if request.accept_mimetypes.best == 'application/json':
                return jsonify({"error": "Invalid username or password"}), 401
            flash("Invalid username or password.", "error")

    if request.accept_mimetypes.best == 'application/json':
        return jsonify({"message": "Please log in"})
    return render_template("login.html")


@auth_bp.route("/login/google")
def login_google():
    redirect_uri = url_for("auth.authorize_google", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route("/authorize/google")
def authorize_google():
    token = oauth.google.authorize_access_token()
    userinfo = token.get("userinfo")
    if userinfo:
        user_id = userinfo["email"]
        if user_id not in USERS:
            USERS[user_id] = {"password": None, "role": "user"}
        user = User(user_id, USERS[user_id]["role"], userinfo["email"], userinfo.get("picture"))
        login_user(user)
        return redirect(url_for("dashboard"))
    flash("Google login failed.", "error")
    return redirect(url_for("auth.login"))


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("index"))
