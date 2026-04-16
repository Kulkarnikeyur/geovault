from flask import Flask, request, send_from_directory,jsonify
import firebase_admin
from firebase_admin import credentials, auth
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(
    __name__,
    static_folder="../dist",
    static_url_path=""
)
load_dotenv()
CORS(app)
cred = credentials.Certificate("geovault-5becd-firebase-adminsdk-fbsvc-bd9ed598b3.json")
firebase_admin.initialize_app(cred)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["geodb"]
users = db["users"]
locations = db["locations"]

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)


@app.route("/api/google-login", methods=["POST"])
def google_login():
    data = request.get_json()
    token = data.get("token")

    if not token:
        return jsonify({"error": "No token provided"}), 400

    try:
        # 🔐 Verify Firebase token
        decoded_token = auth.verify_id_token(token)

        uid = decoded_token["uid"]
        email = decoded_token.get("email")
        name = decoded_token.get("name")

        # 🔍 Check if user exists
        user = users.find_one({"uid": uid})

        if not user:
            users.insert_one({
                "uid": uid,
                "email": email,
                "name": name
            })

        # 🎟️ Create JWT
        access_token = create_access_token(identity=uid)

        return jsonify({
            "access_token": access_token,
            "user": {
                "uid": uid,
                "email": email,
                "name": name
            }
        }), 200

    except Exception as e:
        print("🔥 ERROR:", e)
        return jsonify({"error": str(e)}), 401

@app.route("/api/saveLoc", methods=["POST"])
@jwt_required()
def save_location():
    current_user = get_jwt_identity()
    data = request.json
    location = {
        "uid": current_user,
        "loc": data["loc"],
        "name": data["name"],
        "description": data["description"],
        "date": data["date"]
    }
    locations.insert_one(location)
    return jsonify({"msg":"Location Saved"}), 201


@app.route("/api/savedLoc", methods=["GET"])
@jwt_required()
def get_saved_locations():
    current_user = get_jwt_identity()
    user_locations = locations.find({"uid": current_user})
    locs = []
    for loc in user_locations:
        locs.append({
            "name": loc["name"],
            "description": loc["description"],
            "loc": loc["loc"],
            "date": loc["date"]
        })
    return jsonify(locs), 200


#----------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path=None):
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(debug=True,port=8000,use_reloader=False)
