# import os
# from google.cloud import vision

# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "apikey.json"


# def ocr_handwritten_image(image_path):
#     """Detects handwritten text in the provided image file."""

#     client = vision.ImageAnnotatorClient()

#     with open(image_path, 'rb') as image_file:
#         content = image_file.read()

#     image = vision.Image(content=content)
#     response = client.document_text_detection(image=image)

#     return response.full_text_annotation.text

# if __name__ == '__main__':
#     image_path = input("Enter the path to your image: ")
#     result = ocr_handwritten_image(image_path)
#     print("Recognized Text:\n")
#     print(result)





import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from google.cloud import vision


current_dir = os.path.dirname(os.path.abspath(__file__))
key_path = os.path.join(current_dir, "apikey.json")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = key_path
ocr = Blueprint('ocr', __name__)


@ocr.route('/ocr', methods=['POST'])
@jwt_required()
def ocr_image():
    image_file = request.files.get('image')
    
    if not image_file:
        return jsonify({"error": "No image provided"}), 400

    client = vision.ImageAnnotatorClient()

    content = image_file.read()
    image = vision.Image(content=content)
    response = client.document_text_detection(image=image)
    
    return response.full_text_annotation.text, 201
