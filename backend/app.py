from flask import Flask, request, send_from_directory,jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
app = Flask(
    __name__,
    static_folder="../dist",
    static_url_path=""
)
MONGO_URI = "mongodb+srv://keyurk736_db_user:keyur0211@cluster0.fubpfuc.mongodb.net/"

client = MongoClient(MONGO_URI)
db = client["geodb"]
users = db["users"]
locations = db["locations"]

app.config["JWT_SECRET_KEY"] = "Keyurk@1"  # Token will be signed with this key
jwt = JWTManager(app)


@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    if users.find_one({"name": data["name"]}):
        return jsonify({"msg": "This Username already exists!"}), 409
    
    hash_password = generate_password_hash(data["pass"])
    user = {
        "name": data["name"],
        "password": hash_password
    }
    users.insert_one(user)
    user = users.find_one({"name": data["name"]})
    id=str(user["_id"])
    return jsonify({"msg": "User registered successfully","id":id}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = users.find_one({"name": data["name"]})

    if user and check_password_hash(user["password"], data["pass"]):
        access_token = create_access_token(identity=data["name"])
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Bad username or password"}), 401
    

# @app.route("/api/dashboard", methods=["GET"])
# @jwt_required()
# def dashboard():
#     data = request.json
#     current_user = get_jwt_identity()
#     return "hi"


@app.route("/api/saveLoc", methods=["POST"])
@jwt_required()
def save_location():
    current_user = get_jwt_identity()
    data = request.json
    location = {
        "user": current_user,
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
    user_locations = locations.find({"user": current_user})
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
