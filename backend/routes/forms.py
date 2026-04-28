# routes/forms.py
# Handles all CRUD operations for forms and questions.
# CRUD = Create, Read, Update, Delete

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
# jwt_required() = decorator that blocks access unless a valid token is sent
# get_jwt_identity() = reads the user ID we stored inside the token
from models import db, Form, Question
import json

forms_bp = Blueprint('forms', __name__)


# ─────────────────────────────────────────────
# GET ALL FORMS — GET /api/forms
# Returns all forms belonging to the logged-in teacher
# ─────────────────────────────────────────────
@forms_bp.route('/forms', methods=['GET'])
@jwt_required()
# @jwt_required() must come AFTER @forms_bp.route
# It intercepts the request and checks the Authorization header.
# If no valid token: automatically returns 401 and stops here.
def get_forms():
    teacher_id = int(get_jwt_identity())
    # get_jwt_identity() returns the identity string we stored at login.
    # We stored str(user.id), so we convert it back to int here.

    forms = Form.query.filter_by(teacher_id=teacher_id)\
                      .order_by(Form.created_at.desc())\
                      .all()
    # .order_by(Form.created_at.desc()) = newest forms first
    # .all() = get ALL matching rows as a Python list

    return jsonify({
        'forms': [f.to_dict() for f in forms]
        # List comprehension: run to_dict() on each form and collect
    }), 200


# ─────────────────────────────────────────────
# CREATE FORM — POST /api/forms
# ─────────────────────────────────────────────
@forms_bp.route('/forms', methods=['POST'])
@jwt_required()
def create_form():
    teacher_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    form = Form(
        teacher_id  = teacher_id,
        title       = data['title'],
        description = data.get('description', ''),
        # .get() with a default value: if 'description' not sent, use ''
        is_published = data.get('is_published', False)
    )
    db.session.add(form)
    db.session.commit()

    return jsonify({
        'message': 'Form created',
        'form':    form.to_dict()
    }), 201


# ─────────────────────────────────────────────
# GET ONE FORM — GET /api/forms/<id>
# Returns a single form with all its questions
# ─────────────────────────────────────────────
@forms_bp.route('/forms/<int:form_id>', methods=['GET'])
@jwt_required()
def get_form(form_id):
    # <int:form_id> in the URL captures the number and passes it
    # as the form_id argument. E.g. /api/forms/3 → form_id=3

    teacher_id = int(get_jwt_identity())

    form = Form.query.filter_by(id=form_id, teacher_id=teacher_id).first()
    # We filter by BOTH id AND teacher_id.
    # This prevents Teacher A from reading Teacher B's forms.

    if not form:
        return jsonify({'error': 'Form not found'}), 404
        # 404 = Not Found

    # Build the response including questions
    form_data = form.to_dict()
    form_data['questions'] = [q.to_dict() for q in form.questions]
    # form.questions uses the SQLAlchemy relationship we defined in models.py
    # It automatically fetches all related Question rows

    return jsonify({'form': form_data}), 200


# ─────────────────────────────────────────────
# UPDATE FORM — PUT /api/forms/<id>
# ─────────────────────────────────────────────
@forms_bp.route('/forms/<int:form_id>', methods=['PUT'])
@jwt_required()
def update_form(form_id):
    teacher_id = int(get_jwt_identity())
    data = request.get_json()

    form = Form.query.filter_by(id=form_id, teacher_id=teacher_id).first()
    if not form:
        return jsonify({'error': 'Form not found'}), 404

    # Only update fields that were actually sent in the request.
    # data.get('title', form.title) means:
    # "use the new title if provided, otherwise keep the existing one"
    form.title       = data.get('title',       form.title)
    form.description = data.get('description', form.description)
    form.is_published = data.get('is_published', form.is_published)

    db.session.commit()
    # No need for db.session.add() here — SQLAlchemy is already
    # tracking this object. commit() saves the changes.

    return jsonify({'message': 'Form updated', 'form': form.to_dict()}), 200


# ─────────────────────────────────────────────
# DELETE FORM — DELETE /api/forms/<id>
# ─────────────────────────────────────────────
@forms_bp.route('/forms/<int:form_id>', methods=['DELETE'])
@jwt_required()
def delete_form(form_id):
    teacher_id = int(get_jwt_identity())

    form = Form.query.filter_by(id=form_id, teacher_id=teacher_id).first()
    if not form:
        return jsonify({'error': 'Form not found'}), 404

    db.session.delete(form)
    db.session.commit()
    # Because we set cascade='all, delete-orphan' in models.py,
    # deleting the form automatically deletes all its questions,
    # responses, and answers too. No manual cleanup needed.

    return jsonify({'message': 'Form deleted'}), 200


# ─────────────────────────────────────────────
# ADD QUESTION — POST /api/forms/<id>/questions
# ─────────────────────────────────────────────
@forms_bp.route('/forms/<int:form_id>/questions', methods=['POST'])
@jwt_required()
def add_question(form_id):
    teacher_id = int(get_jwt_identity())
    data = request.get_json()

    # First verify this form belongs to the teacher
    form = Form.query.filter_by(id=form_id, teacher_id=teacher_id).first()
    if not form:
        return jsonify({'error': 'Form not found'}), 404

    # Validate question_type is one of the allowed values
    allowed_types = ['text', 'multiple_choice', 'checkbox', 'dropdown']
    if data.get('question_type') not in allowed_types:
        return jsonify({'error': f'question_type must be one of {allowed_types}'}), 400

    # Convert options list to a JSON string for storage
    options = data.get('options', [])
    # options might come in as: ["Option A", "Option B", "Option C"]
    options_json = json.dumps(options) if options else None
    # json.dumps() converts the Python list to a JSON string:
    # ["Option A", "Option B"] → '["Option A", "Option B"]'
    # We store this string in the TEXT column in the database.

    # Auto-set order: put new question at the end
    existing_count = Question.query.filter_by(form_id=form_id).count()
    # .count() returns the number of rows, not the rows themselves.

    question = Question(
        form_id       = form_id,
        question_text = data.get('question_text', ''),
        question_type = data['question_type'],
        options_json  = options_json,
        order_index   = data.get('order_index', existing_count)
    )
    db.session.add(question)
    db.session.commit()

    return jsonify({
        'message':  'Question added',
        'question': question.to_dict()
    }), 201

# ─────────────────────────────────────────────
# PUBLIC GET FORM — GET /api/public/forms/<id>
# No authentication required (for students)
# ─────────────────────────────────────────────
@forms_bp.route('/public/forms/<int:form_id>', methods=['GET'])
def get_public_form(form_id):
    form = Form.query.get(form_id)

    if not form or not form.is_published:
        return jsonify({'error': 'Form not found'}), 404

    form_data = form.to_dict()
    form_data['questions'] = [q.to_dict() for q in form.questions]

    return jsonify({'form': form_data}), 200
