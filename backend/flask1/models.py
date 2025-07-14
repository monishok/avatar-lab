from datetime import datetime, timezone
from flask1 import db, login_manager
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):                                                                                                             
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    is_admin = db.Column(db.Boolean(), default=False)
    user_data = db.relationship('User_Data', backref='author', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

class User_Data(db.Model):
    __tablename__ = 'user_data'

    id = db.Column(db.Integer, primary_key=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) 

    date_posted = db.Column(db.DateTime, nullable=False,  default=lambda: datetime.now(timezone.utc))
    
    text_history = db.Column(db.Text, nullable=False)  
    video_path = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f"Post('{self.user_id}', '{self.date_posted}')"

