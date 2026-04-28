// lib/api.ts
// A central helper for all API calls to Flask.
// Instead of writing fetch() manually on every page,
// we import these functions and call them simply.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
// NEXT_PUBLIC_ variables are loaded from .env.local
// The || fallback means: use localhost:5000 if the variable isn't set

// getToken reads the saved JWT from the browser's localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  // typeof window === 'undefined' checks if we're on the server
  // localStorage doesn't exist on the server — this prevents crashes
  return localStorage.getItem('token')
}

// authHeaders returns the Authorization header needed for protected routes
function authHeaders(): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    // Spread syntax: adds Authorization header only if token exists
    // Bearer is the standard prefix for JWT tokens
  }
}

// ── Auth ──────────────────────────────────────
export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
    // JSON.stringify converts a JS object to a JSON string
    // Flask receives it and parses it with request.get_json()
  })
  return res.json()
  // .json() parses the JSON response body back into a JS object
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

// ── Forms ─────────────────────────────────────
export async function getForms() {
  const res = await fetch(`${API_URL}/api/forms`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function createForm(title: string, description: string) {
  const res = await fetch(`${API_URL}/api/forms`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, description })
  })
  return res.json()
}

export async function getForm(id: string) {
  const res = await fetch(`${API_URL}/api/forms/${id}`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function updateForm(id: string, data: object) {
  const res = await fetch(`${API_URL}/api/forms/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteForm(id: string) {
  const res = await fetch(`${API_URL}/api/forms/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return res.json()
}

export async function addQuestion(formId: string, data: object) {
  const res = await fetch(`${API_URL}/api/forms/${formId}/questions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

// ── Responses ─────────────────────────────────
export async function getResponses(formId: string) {
  const res = await fetch(`${API_URL}/api/forms/${formId}/responses`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function submitResponse(formId: string, data: object) {
  const res = await fetch(`${API_URL}/api/submit/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // No auth header — public endpoint
    body: JSON.stringify(data)
  })
  return res.json()
}

// ── Public form (for students) ─────────────────
export async function getPublicForm(formId: string) {
  const res = await fetch(`http://localhost:5000/api/public/forms/${formId}`)
  return res.json()
}