from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
from db import get_db  # Ensure you have this helper function to get a db instance

from datetime import datetime
from pymongo import MongoClient
from langchain.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

documents = Blueprint('documents', __name__)


def upload_data_to_vector_db(pdf_path, persist_directory):
    # Load the PDF document
    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()

    # Split the document text into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=10)
    texts = text_splitter.split_documents(documents)

    # Generate embeddings
    embeddings = OpenAIEmbeddings()

    # Store vectors in Chroma
    vectordb = Chroma.from_documents(documents=texts, 
                                     embedding=embeddings,
                                     persist_directory=persist_directory)
    vectordb.persist()
    return vectordb

# Usage:
# vectordb = upload_data(pdf_path, persist_directory)


@documents.route('/create', methods=['POST'])
@jwt_required()
def create_document():
    db = get_db()
    user_id = get_jwt_identity()  # Get the identity of the current user
    data = request.get_json()
    
    new_document = {
        "userId": user_id,
        "name": data.get('name'),
        "type": data.get('type'),
        "parentId": data.get('parentId') or None,
        "children": [],
        "content": data.get('content') or None,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    doc = db.documents.insert_one(new_document)
    
    return jsonify({"message": "Document created", "id": str(doc.inserted_id)}), 201

@documents.route('/get', methods=['GET'])
@jwt_required()
def get_documents():
    db = get_db()
    user_id = get_jwt_identity()
    user_documents = list(db.documents.find({"userId": user_id}))
    
    # Convert ObjectId instances to strings for JSON serialization
    for doc in user_documents:
        doc["_id"] = str(doc["_id"])
    
    return jsonify(user_documents)

@documents.route('/delete/<doc_id>', methods=['DELETE'])
@jwt_required()
def delete_document(doc_id):
    db = get_db()
    user_id = get_jwt_identity()  # Get the identity of the current user

    # Find the document to ensure it belongs to the current user
    document = db.documents.find_one({"_id": ObjectId(doc_id), "userId": user_id})

    if document:
        # Delete the document
        db.documents.delete_one({"_id": ObjectId(doc_id)})
        return jsonify({"message": "Document deleted"}), 200
    else:
        return jsonify({"message": "Document not found"}), 404

