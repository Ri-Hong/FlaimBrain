from flask import Blueprint, jsonify, request
from pymongo import ASCENDING
from flask_jwt_extended import jwt_required, get_jwt_identity
from db import get_db
from datetime import datetime

chatHistory = Blueprint('chatHistory', __name__)


@chatHistory.route('/save-message', methods=['POST'])
@jwt_required()
def save_message_endpoint():
    db = get_db()
    data = request.get_json()
    user_id = get_jwt_identity()  # Get the identity of the current user
    content = data.get('content')
    documentName = data.get('documentName')
    
    db.chatHistory.insert_one({'user_id': user_id, 'content': content, 'documentName': documentName, 'createdAt': datetime.utcnow()})

    return jsonify(message="Message saved successfully"), 201


@chatHistory.route('/get-chat-history/<string:document_name>', methods=['GET'])
@jwt_required()
def get_chat_history(document_name):
    db = get_db()
    chat_history = list(db.chatHistory.find({"documentName": document_name}).sort('created_at', ASCENDING))
    for message in chat_history:
        message['_id'] = str(message['_id'])  # Convert ObjectId to string
    return jsonify(chat_history)


@chatHistory.route('/delete-conversation/<string:document_name>', methods=['DELETE'])
@jwt_required()
def delete_conversation(document_name):
    db = get_db()
    result = db.chatHistory.delete_many({"documentName": document_name})
    
    if result.deleted_count > 0:
        return jsonify(message=f"{result.deleted_count} messages deleted successfully"), 200
    else:
        return jsonify(message="No messages found to delete"), 404
