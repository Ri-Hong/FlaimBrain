# app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

import dotenv
import os

from routes.auth import auth  # Importing the Blueprint
from routes.documents import documents  # Importing the Blueprint
from routes.ocr import ocr  # Importing the Blueprint
# from routes.chat import chat  # Importing the Blueprint

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow only specific origin
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=48)  # Set tokens to expire after 1 hour
jwt = JWTManager(app)

app.register_blueprint(auth, url_prefix='/auth')  # Registering the Blueprint
app.register_blueprint(documents, url_prefix='/documents')  # Registering the Blueprint
app.register_blueprint(ocr, url_prefix='/ocr')  # Registering the Blueprint


if __name__ == '__main__':
    app.run(debug=True)
