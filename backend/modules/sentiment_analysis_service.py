import cv2
import numpy as np
from flask import Flask, request, jsonify
from deepface import DeepFace
import base64
import re
from PIL import Image
import io

app = Flask(__name__)

emotion_scores = {
    'happy': 5,
    'surprise': 2,
    'neutral': 1,
    'sad': -3,
    'angry': -5,
    'disgust': -5,
    'fear': -6
}
emotion_ratio_threshold = 15.0

def analyze_frame_for_score_delta(frame):
    try:
        results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, silent=True)
        
        if isinstance(results, list) and len(results) > 0:
            emotion_distribution = results[0]['emotion']
            frame_score_delta = 0
            contributors = {}
            
            for emotion, percentage in emotion_distribution.items():
                if percentage >= emotion_ratio_threshold:
                    frame_score_delta += emotion_scores.get(emotion, 0)
                    contributors[emotion] = percentage
            
            return frame_score_delta, contributors
    except Exception as e:
        print(f"Error during analysis: {e}")
        pass
    return 0, {}

@app.route('/analyze', methods=['POST'])
def analyze_image():
    data = request.json
    if 'image' not in data:
        return jsonify({'error': 'No image data provided'}), 400

    image_data = re.sub('^data:image/.+;base64,', '', data['image'])
    
    try:
        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes))
        frame = np.array(img)
        
        score_delta, contributors = analyze_frame_for_score_delta(frame)
        
        return jsonify({
            'score_delta': score_delta,
            'contributors': contributors
        })

    except (base64.binascii.Error, ValueError) as e:
        return jsonify({'error': 'Invalid base64 string'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 