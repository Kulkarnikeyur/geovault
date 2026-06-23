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
from werkzeug.utils import secure_filename
from bson import ObjectId

app = Flask(
    __name__,
    static_folder="../dist",
    static_url_path=""
)
load_dotenv()
CORS(app)
cred = credentials.Certificate("geovault-5becd-firebase-adminsdk-fbsvc-bd9ed598b3.json")
firebase_admin.initialize_app(cred)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PHOTO_UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads",
    "photos"
)

VIDEO_UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads",
    "videos"
)

os.makedirs(PHOTO_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VIDEO_UPLOAD_FOLDER, exist_ok=True)
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

@app.route("/api/upload/photos", methods=["POST"])
@jwt_required()
def upload_photos():

    if "file" not in request.files:
        return jsonify({"msg": "No file"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"msg": "No selected file"}), 400

    filename = secure_filename(file.filename)

    filepath = os.path.join(
        PHOTO_UPLOAD_FOLDER,
        filename
    )

    file.save(filepath)

    return jsonify({
        "url": f"/uploads/photos/{filename}"
    }), 200

@app.route("/api/upload/videos", methods=["POST"])
@jwt_required()
def upload_videos():

    if "file" not in request.files:
        return jsonify({"msg": "No file"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"msg": "No selected file"}), 400

    filename = secure_filename(file.filename)

    filepath = os.path.join(
        VIDEO_UPLOAD_FOLDER,
        filename
    )

    file.save(filepath)

    return jsonify({
        "url": f"/uploads/videos/{filename}"
    }), 200

@app.route('/uploads/photos/<filename>')
def uploaded_photo(filename):
    return send_from_directory(
        PHOTO_UPLOAD_FOLDER,
        filename
    )

@app.route('/uploads/videos/<filename>')
def uploaded_video(filename):
    return send_from_directory(
        VIDEO_UPLOAD_FOLDER,
        filename
    )

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
        "date": data["date"],
        "photos": data.get("photos", []),
        "videos": data.get("videos", []),
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
            "id": str(loc["_id"]),
            "name": loc["name"],
            "description": loc["description"],
            "loc": loc["loc"],
            "date": loc["date"],
            "photos": loc.get("photos", []),
            "videos": loc.get("videos", [])
        })
    return jsonify(locs), 200

@app.route("/api/saveLoc/<loc_id>", methods=["DELETE"])
@jwt_required()
def delete_location(loc_id):
    current_user = get_jwt_identity()

    result = locations.delete_one({
        "_id": ObjectId(loc_id),
        "uid": current_user
    })

    if result.deleted_count == 1:
        return jsonify({"msg": "Location deleted"}), 200

    return jsonify({"msg": "Location not found"}), 404


#----------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path=None):
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(debug=True,port=8000,use_reloader=False)
