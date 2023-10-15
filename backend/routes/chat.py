import os
from langchain.vectorstores import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.embeddings.openai import OpenAIEmbeddings
import dotenv

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity


chat = Blueprint('chat', __name__)

dotenv.load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")



current_dir = os.path.dirname(os.path.abspath(__file__))
persist_directory = os.path.join(current_dir, "storage")

embedding = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))


def handle_query(user_input):
    vectordb = Chroma(persist_directory=persist_directory, embedding_function=embedding)
    retriever = vectordb.as_retriever(search_kwargs={"k": 3})
    llm = ChatOpenAI(model_name='gpt-4')
    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)

    query = f"###Prompt {user_input}"
    try:
        llm_response = qa(query)
        return llm_response["result"]
    except Exception as err:
        return f'Exception occurred. Please try again: {str(err)}'


@chat.route('/get-response', methods=['POST'])
@jwt_required()
def get_response():
    data = request.get_json()
    query = data.get('query')

    response = handle_query(query)
        
    return jsonify({"response": response}), 200
