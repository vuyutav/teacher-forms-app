# routes/responses.py
# Handles: public form submission + teacher viewing responses

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Form, Question, Response, Answer
import json

responses_bp = Blueprint('responses', __name__)


# ─────────────────────────────────────────────
# PUBLIC SUBMIT — POST /api/submit/<form_id>
# No login required — this is what students use.
# ─────────────────────────────────────────────
@responses_bp.route('/submit/<int:form_id>', methods=['POST'])
# Notice: NO @jwt_required() here — students don't have accounts.
def submit_response(form_id):
    data = request.get_json()

    # Check the form exists AND is published
    form = Form.query.filter_by(id=form_id, is_published=True).first()
    if not form:
        return jsonify({'error': 'Form not found or not published'}), 404
    # Students can only submit to published forms.
    # This prevents submissions to draft forms.

    # Create the response record (the "submission")
    response = Response(
        form_id         = form_id,
        respondent_name = data.get('respondent_name', 'Anonymous')
        # If no name provided, store 'Anonymous'
    )
    db.session.add(response)
    db.session.flush()
    # flush() sends the INSERT to the database but doesn't commit yet.
    # This gives us response.id to use for the answers below,
    # without fully committing the transaction.
    # If something fails later, we can still rollback everything.

    # Process each answer submitted
    answers_data = data.get('answers', [])
    # Expected format from frontend:
    # [{"question_id": 1, "answer_text": "Paris"},
    #  {"question_id": 2, "answer_text": "Option A"}]

    for ans in answers_data:
        question_id = ans.get('question_id')
        answer_text = ans.get('answer_text', '')

        # Verify the question actually belongs to this form
        question = Question.query.filter_by(
            id=question_id,
            form_id=form_id
        ).first()

        if not question:
            # Skip invalid question IDs silently
            continue

        # For checkbox answers, the frontend sends a list.
        # We store it as a JSON string.
        if isinstance(answer_text, list):
            # isinstance() checks if answer_text is a Python list
            answer_text = json.dumps(answer_text)

        answer = Answer(
            response_id = response.id,
            question_id = question_id,
            answer_text = str(answer_text)
        )
        db.session.add(answer)

    db.session.commit()
    # Now commit everything: the response + all answers saved together.
    # If this fails, nothing is saved (keeps the database consistent).

    return jsonify({'message': 'Response submitted successfully'}), 201


# ─────────────────────────────────────────────
# GET RESPONSES — GET /api/forms/<id>/responses
# Teacher only — must be logged in.
# ─────────────────────────────────────────────
@responses_bp.route('/forms/<int:form_id>/responses', methods=['GET'])
@jwt_required()
def get_responses(form_id):
    teacher_id = int(get_jwt_identity())

    # Verify this form belongs to the teacher
    form = Form.query.filter_by(id=form_id, teacher_id=teacher_id).first()
    if not form:
        return jsonify({'error': 'Form not found'}), 404

    # Fetch all responses for this form
    responses = Response.query\
        .filter_by(form_id=form_id)\
        .order_by(Response.submitted_at.desc())\
        .all()

    # Get all questions for the form (for the column headers in the table)
    questions = Question.query\
        .filter_by(form_id=form_id)\
        .order_by(Question.order_index)\
        .all()

    return jsonify({
        'form':      form.to_dict(),
        'questions': [q.to_dict() for q in questions],
        'responses': [r.to_dict() for r in responses],
        'total':     len(responses)
        # len() gives the count of responses
    }), 200