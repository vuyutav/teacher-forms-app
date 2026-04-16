# models.py
# SQLAlchemy "models" are Python classes that represent database tables.
# Each attribute in the class = a column in the table.
# SQLAlchemy handles all the SQL for us — we just write Python.

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# db is the SQLAlchemy instance.
# We create it here and import it wherever we need it.
db = SQLAlchemy()

# ─────────────────────────────────────────────
# USER MODEL
# ─────────────────────────────────────────────
class User(db.Model):
    __tablename__ = 'users'
    # __tablename__ tells SQLAlchemy which database table
    # this class maps to

    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name       = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # This defines a relationship: user.forms gives you
    # all forms belonging to this user as a Python list.
    # backref='teacher' lets you do form.teacher to get the user back.
    forms = db.relationship('Form', backref='teacher', lazy=True,
                            cascade='all, delete-orphan')

    def to_dict(self):
        # to_dict() converts this object to a plain Python dictionary
        # so Flask can turn it into JSON to send to the frontend
        return {
            'id':         self.id,
            'email':      self.email,
            'name':       self.name,
            'created_at': self.created_at.isoformat()
            # .isoformat() converts datetime to a string like
            # "2024-04-16T10:30:00" which JSON can handle
        }
        # Notice: we never include password_hash here!
        # Never send password data to the frontend.

# ─────────────────────────────────────────────
# FORM MODEL
# ─────────────────────────────────────────────
class Form(db.Model):
    __tablename__ = 'forms'

    id           = db.Column(db.Integer, primary_key=True)
    teacher_id   = db.Column(db.Integer, db.ForeignKey('users.id'),
                             nullable=False)
    # ForeignKey('users.id') creates the link to the users table
    # This must match the __tablename__ of User + the column name

    title        = db.Column(db.String(255), nullable=False)
    description  = db.Column(db.Text)
    is_published = db.Column(db.Boolean, default=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    # A form has many questions and many responses
    questions = db.relationship('Question', backref='form', lazy=True,
                                cascade='all, delete-orphan',
                                order_by='Question.order_index')
    responses = db.relationship('Response', backref='form', lazy=True,
                                cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':           self.id,
            'teacher_id':   self.teacher_id,
            'title':        self.title,
            'description':  self.description,
            'is_published': self.is_published,
            'created_at':   self.created_at.isoformat(),
            'question_count': len(self.questions)
            # len() counts how many questions this form has
        }

# ─────────────────────────────────────────────
# QUESTION MODEL
# ─────────────────────────────────────────────
class Question(db.Model):
    __tablename__ = 'questions'

    id            = db.Column(db.Integer, primary_key=True)
    form_id       = db.Column(db.Integer, db.ForeignKey('forms.id'),
                              nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=False)
    # Valid values: 'text', 'multiple_choice', 'checkbox', 'dropdown'

    options_json  = db.Column(db.Text)
    # Stored as a JSON string in the database.
    # We parse it with Python's json module when reading.

    order_index   = db.Column(db.Integer, default=0)

    # A question can have many answers (one per student response)
    answers = db.relationship('Answer', backref='question', lazy=True,
                              cascade='all, delete-orphan')

    def to_dict(self):
        import json
        return {
            'id':            self.id,
            'form_id':       self.form_id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'options':       json.loads(self.options_json)
                             if self.options_json else [],
            # json.loads() converts the stored string back to a list
            # If options_json is None, return an empty list []
            'order_index':   self.order_index
        }

# ─────────────────────────────────────────────
# RESPONSE MODEL
# ─────────────────────────────────────────────
class Response(db.Model):
    __tablename__ = 'responses'

    id              = db.Column(db.Integer, primary_key=True)
    form_id         = db.Column(db.Integer, db.ForeignKey('forms.id'),
                                nullable=False)
    respondent_name = db.Column(db.String(255))
    submitted_at    = db.Column(db.DateTime, default=datetime.utcnow)

    answers = db.relationship('Answer', backref='response', lazy=True,
                              cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':              self.id,
            'form_id':         self.form_id,
            'respondent_name': self.respondent_name,
            'submitted_at':    self.submitted_at.isoformat(),
            'answers':         [a.to_dict() for a in self.answers]
            # List comprehension: runs a.to_dict() for every answer
            # and collects the results into a list
        }

# ─────────────────────────────────────────────
# ANSWER MODEL
# ─────────────────────────────────────────────
class Answer(db.Model):
    __tablename__ = 'answers'

    id          = db.Column(db.Integer, primary_key=True)
    response_id = db.Column(db.Integer, db.ForeignKey('responses.id'),
                            nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'),
                            nullable=False)
    answer_text = db.Column(db.Text)

    def to_dict(self):
        return {
            'id':          self.id,
            'response_id': self.response_id,
            'question_id': self.question_id,
            'answer_text': self.answer_text
        }