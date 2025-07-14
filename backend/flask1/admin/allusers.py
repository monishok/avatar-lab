from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from flask1 import db
from flask1.models import User_Data, User
from datetime import datetime

admin_hist = Blueprint('admin_hist', __name__)

@admin_hist.route('/admin_history', methods=['GET'])
@login_required
def get_all_user_history():
    if not current_user.is_admin:
        return jsonify({"message": "Unauthorized"}), 403

    start = request.args.get('start_date')
    end = request.args.get('end_date')

    query = User_Data.query.join(User).order_by(User_Data.date_posted.desc())

    if start:
        try:
            start_dt = datetime.strptime(start, "%Y-%m-%dT%H:%M")
            query = query.filter(User_Data.date_posted >= start_dt)
        except ValueError:
            return jsonify({"message": "Invalid start_date format"}), 400

    if end:
        try:
            end_dt = datetime.strptime(end, "%Y-%m-%dT%H:%M")
            query = query.filter(User_Data.date_posted <= end_dt)
        except ValueError:
            return jsonify({"message": "Invalid end_date format"}), 400

    all_data = query.all()
    result = [{
        "username": data.author.username, 
        "text": data.text_history,
        "date": data.date_posted.strftime("%Y-%m-%d %H:%M:%S"),
        "video_url": f"/{data.video_path}"
    } for data in all_data]

    return jsonify(result)

@admin_hist.route("/admin_auth")
@login_required
def check_auth():
    if current_user.is_admin:
        return jsonify({"authenticated": current_user.is_authenticated})
    else:
        return jsonify({"authenticated": False})    