# auth.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash
from db import get_db

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    db = get_db()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify(message="Username and password required"), 400
    
    user = db.users.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity={'username': username})
        return jsonify(access_token=access_token)
    
    return jsonify(message="Invalid credentials"), 401


@auth.route('/register', methods=['POST'])
def register():
    db = get_db()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify(message="Username and password required"), 400
    
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    db.users.insert_one({'username': username, 'password': hashed_password})

    return jsonify(message="User registered successfully"), 201
