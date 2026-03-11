from flask import Flask, render_template, request, jsonify, send_file
import os, re

import torch
from transformers import T5TokenizerFast, T5ForConditionalGeneration

from PyPDF2 import PdfReader

import jellyfish
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity



import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')



def is_eng(text):
    return bool(re.match(r'[A-Za-z0-9\s\.,!?-]*$', text))

def is_url(text):
    return bool(re.match(r'https?://[^\s]+', text))

def translate_texts(input_texts, tokenizer, model, device, max_length = 512):

    if isinstance(input_texts, str):
        input_texts = input_texts.split('\n')
    
    results = []
    for input_text in input_texts:
        if input_text.strip() == '':
            results.append(input_text)
            continue
        elif is_eng(input_text) or is_url(input_text):
            results.append(input_text)
            continue

        inputs = tokenizer(input_text, return_tensors = 'pt', padding = True, truncation = True, max_length = max_length).to(device)

        with torch.no_grad():
            generated_ids = model.generate(input_ids = inputs['input_ids'], max_length = max_length, num_beams = 4, length_penalty = 2.0)

        translated_text = tokenizer.decode(generated_ids[0], skip_special_tokens = True)
        results.append(translated_text)

    return results



@app.route('/translate', methods = ['POST'])
def translate():
    data = request.json
    input_text = data.get('input_text')

    output_text = translate_texts(input_text, tokenizer, model, DEVICE)
    output_text = '\n'.join(output_text)

    return jsonify({'output_text': output_text})



app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'txt', 'pdf'}

def allowed_file(file_name, allowed_extensions):
    return '.' in file_name and file_name.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/upload', methods = ['POST'])
def upload():   
    data = request.files
    file = data.get('file')
    
    if file and allowed_file(file.filename, app.config['ALLOWED_EXTENSIONS']):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        return jsonify({'message': 'File uploaded successfully', 'file_path': file_path})
    else:
        return jsonify({'error': 'File type not allowed'}), 400
    
@app.route('/translate_file', methods=['POST'])
def translate_file():
    data = request.json
    file_name = data.get('file_name')

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)

    output_text = ''
    file_ext = file_name.rsplit('.', 1)[1].lower()
    if file_ext == 'txt':
        with open(file_path, 'r', encoding = 'utf-8') as f:
            text = f.read()

        output_text = '\n'.join(translate_texts(text, tokenizer, model, DEVICE))

    elif file_ext == 'pdf':
        reader = PdfReader(file_path)
        text = '\n'.join([page.extract_text() for page in reader.pages])

        output_text = '\n'.join(translate_texts(text, tokenizer, model, DEVICE))
    else:
        pass

    output_file_name = f'{file_name.rsplit(".", 1)[0]}_translated.txt'
    output_file_path = os.path.join(app.config['UPLOAD_FOLDER'], output_file_name)

    with open(output_file_path, 'w', encoding = 'utf-8') as f:
        f.write(output_text)

    return send_file(output_file_path, as_attachment = True, download_name = output_file_name)

@app.route('/delete_files', methods=['POST'])
def delete_files():
    data = request.json
    original_file = data.get('original_file')
    translated_file = data.get('translated_file')

    original_file_path = os.path.join(app.config['UPLOAD_FOLDER'], original_file)
    translated_file_path = os.path.join(app.config['UPLOAD_FOLDER'], translated_file)

    try:
        if os.path.exists(original_file_path):
            os.remove(original_file_path)

        if os.path.exists(translated_file_path):
            os.remove(translated_file_path)

        return jsonify({'message': 'Files deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Error deleting files: {str(e)}'}), 500



def calculate_similarity(answer_string, input_string):
    jaro_winkler_sim = jellyfish.jaro_winkler_similarity(answer_string, input_string)

    embeddings = sim_model.encode([answer_string, input_string])
    cos_sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

    weight_jw = 0.3
    weight_cos = 0.7
    final_similarity = float(weight_jw * jaro_winkler_sim + weight_cos * cos_sim)

    return final_similarity

@app.route('/check_similarity', methods=['POST'])
def check_similarity():
    data = request.get_json()
    answer_string = data.get("answer_string")
    input_string = data.get("input_string")
    
    similarity = calculate_similarity(answer_string, input_string)
    
    return jsonify({"similarity": similarity})



if __name__ == '__main__':
    DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    tokenizer = T5TokenizerFast.from_pretrained('paust/pko-t5-base')
    model = T5ForConditionalGeneration.from_pretrained('paust/pko-t5-base')

    model.load_state_dict(torch.load(os.path.join(BASE_DIR, 'model', 'pkot5_weights.pth'), weights_only = True, map_location = torch.device('cpu')))
    model.eval()

    model.to(DEVICE)

    sim_model = SentenceTransformer('snunlp/KR-SBERT-V40K-klueNLI-augSTS')

    app.run(debug = True)