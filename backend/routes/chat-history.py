from flask import Flask, request, jsonify

app = Flask(__name__)
from db import get_db


@app.route('/save-message', methods=['POST'])
def save_message_endpoint():
    data = request.get_json()
    save_message(data['sender'], data['content'], data['chatSessionId'])
    return jsonify({"message": "Message saved"}), 200

@app.route('/get-chat-history/<chat_session_id>', methods=['GET'])
def get_chat_history(chat_session_id):
    chat_history = list(chat_collection.find({"chatSessionId": chat_session_id}))
    for message in chat_history:
        message['_id'] = str(message['_id'])  # Convert ObjectId to string
    return jsonify(chat_history)

if __name__ == '__main__':
    app.run(debug=True)
