const base = process.env.API_URL || 'http://127.0.0.1:3001/api';

async function req(method, path, body, token) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${text}`);
  }
  return data;
}

const login = await req('POST', '/auth/login', {
  email: 'demo@coda.school',
  password: 'demo1234',
});
if (!login.accessToken || !login.user?.email) throw new Error('login failed');

const me = await req('GET', '/auth/me', null, login.accessToken);
if (me.email !== 'demo@coda.school') throw new Error('me mismatch');

const dash = await req('GET', '/dashboard', null, login.accessToken);
if (!dash.kpis || typeof dash.kpis.activeStudents !== 'number') {
  throw new Error('dashboard missing kpis');
}

const students = await req('GET', '/students', null, login.accessToken);
if (!Array.isArray(students) || students.length < 4) {
  throw new Error('expected seeded students');
}

const created = await req(
  'POST',
  '/students',
  {
    name: 'Smoke Test Student',
    email: 'smoke@coda.school',
    primaryInstrument: 'piano',
    level: 'beginner',
  },
  login.accessToken,
);
if (!created.id) throw new Error('create student failed');

await req('DELETE', `/students/${created.id}`, null, login.accessToken);

const lessons = await req('GET', '/lessons', null, login.accessToken);
if (!Array.isArray(lessons) || lessons.length === 0) {
  throw new Error('expected seeded lessons');
}

console.log('Coda API smoke OK', {
  students: students.length,
  lessons: lessons.length,
  activeStudents: dash.kpis.activeStudents,
  db: dash.dbSource,
});
