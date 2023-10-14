# db.py
import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi

def get_db():
    username = os.getenv('MONGODB_USERNAME')
    password = os.getenv('MONGODB_PASSWORD')
    uri = f"mongodb+srv://{username}:{password}@flaimbrain.q7hbiyx.mongodb.net/?retryWrites=true&w=majority"
    client = MongoClient(uri, server_api=ServerApi('1'))
    db = client.Database  # Replace 'mydatabase' with your database name
    return db
