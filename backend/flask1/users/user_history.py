import os
from flask import Blueprint, jsonify, current_app
from flask_login import current_user, login_required
from flask1 import db
from flask1.models import User_Data
from flask import send_from_directory

hist = Blueprint('hist', __name__)

@hist.route("/history", methods = ['GET'])
@login_required
def history():
    user_id = current_user.id
    username = current_user.username  # Make sure your User model has a 'username' field

    # Query the user's data ordered by most recent
    user_data = User_Data.query.filter_by(user_id=user_id).order_by(User_Data.date_posted.desc()).all()

    history_list = []
    for idx, entry in enumerate(user_data, start=1):

        history_list.append({
            "serial": idx,
            "text": entry.text_history,
            "date": entry.date_posted.strftime("%Y-%m-%d %H:%M:%S"),
            "video_url": f"/{entry.video_path}"  
        })

    return jsonify({
        "username": username,
        "history": history_list
    })

@hist.route('/files/output_final/<path:filename>')
def serve_output_video(filename):
    base_dir = current_app.config['BASE_DIR']
    output_folder = os.path.join(base_dir, 'files', 'output_final')
    return send_from_directory(output_folder, filename)
