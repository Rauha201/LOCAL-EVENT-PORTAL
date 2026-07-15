// Manager Dashboard: guard the page, then load/create/edit/delete
// the logged-in manager's own events via the Event CRUD API.

const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// This redirect only improves the experience — it is NOT the real
// security boundary. Someone could edit localStorage in devtools and
// remove this check entirely; what actually stops them is
// authorize('manager') on the server, which verifies the JWT itself
// and can't be faked from the browser.
if (!token || role !== 'manager') {
  window.location.href = '/login.html';
}

let myEvents = [];
let editingEventId = null;

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function createManagerEventRow(event) {
  const price = Number(event.ticket_price);
  const priceLabel = price === 0 ? 'Free' : `$${price}`;
  const dateLabel = new Date(event.event_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const imageUrl = `/images/${event.image || 'event-placeholder-1.jpg'}`;

  return `
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 bg-paper rounded-lg shadow-sm p-4">
      <div class="w-full sm:w-24 h-24 rounded-md bg-moss-100 bg-cover bg-center flex-shrink-0" style="background-image:url('${imageUrl}')"></div>
      <div class="flex-1">
        <span class="font-stub text-[11px] uppercase tracking-widest text-moss">${event.category}</span>
        <h3 class="font-display font-semibold text-lg leading-snug">${event.title}</h3>
        <p class="text-sm text-ink/60">${event.location} &middot; ${dateLabel} &middot; ${priceLabel}</p>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button data-edit="${event.event_id}" class="px-4 py-2 text-sm rounded-full border-2 border-ink text-ink hover:bg-ink hover:text-white transition-colors">Edit</button>
        <button data-delete="${event.event_id}" class="px-4 py-2 text-sm rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
      </div>
    </div>`;
}

async function loadMyEvents() {
  const listEl = document.getElementById('event-list');
  const emptyEl = document.getElementById('empty-state');

  try {
    const res = await fetch('/api/events/mine', { headers: authHeaders() });
    myEvents = await res.json();
    if (!res.ok) throw new Error(myEvents.message || 'Could not load your events');

    if (myEvents.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
    } else {
      emptyEl.classList.add('hidden');
      listEl.innerHTML = myEvents.map(createManagerEventRow).join('');
    }
  } catch (err) {
    listEl.innerHTML = `<p class="text-red-600 text-center py-8">${err.message}</p>`;
  }
}

function showForm(heading, submitLabel) {
  document.getElementById('event-form').classList.remove('hidden');
  document.getElementById('form-heading').textContent = heading;
  document.getElementById('submit-btn').textContent = submitLabel;
  document.getElementById('event-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  document.getElementById('event-form').reset();
  document.getElementById('event-id').value = '';
  editingEventId = null;
  document.getElementById('event-form').classList.add('hidden');
  document.getElementById('form-message').classList.add('hidden');
}

function fillFormForEdit(event) {
  editingEventId = event.event_id;
  document.getElementById('event-id').value = event.event_id;
  document.getElementById('title').value = event.title;
  document.getElementById('description').value = event.description || '';
  document.getElementById('category').value = event.category;
  document.getElementById('organizer').value = event.organizer;
  document.getElementById('eventDate').value = String(event.event_date).slice(0, 10);
  document.getElementById('eventTime').value = String(event.event_time).slice(0, 5);
  document.getElementById('location').value = event.location;
  document.getElementById('ticketPrice').value = event.ticket_price;
  document.getElementById('maxParticipants').value = event.max_participants;
  document.getElementById('image').value = event.image || '';
  showForm('Edit Event', 'Update Event');
}

function readForm() {
  return {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    category: document.getElementById('category').value,
    organizer: document.getElementById('organizer').value.trim(),
    eventDate: document.getElementById('eventDate').value,
    eventTime: document.getElementById('eventTime').value,
    location: document.getElementById('location').value.trim(),
    ticketPrice: document.getElementById('ticketPrice').value,
    maxParticipants: document.getElementById('maxParticipants').value,
    image: document.getElementById('image').value.trim()
  };
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const messageEl = document.getElementById('form-message');
  const isEditing = Boolean(editingEventId);
  const url = isEditing ? `/api/events/${editingEventId}` : '/api/events';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(readForm()) });
    const data = await res.json();

    if (!res.ok) {
      messageEl.textContent = data.message || 'Something went wrong';
      messageEl.classList.remove('hidden');
      return;
    }

    resetForm();
    loadMyEvents();
  } catch (err) {
    messageEl.textContent = 'Could not reach the server.';
    messageEl.classList.remove('hidden');
  }
}

async function handleListClick(e) {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;

  if (editId) {
    const event = myEvents.find((ev) => String(ev.event_id) === editId);
    if (event) fillFormForEdit(event);
  }

  if (deleteId) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    const res = await fetch(`/api/events/${deleteId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) loadMyEvents();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMyEvents();

  document.getElementById('new-event-btn').addEventListener('click', () => {
    resetForm();
    showForm('New Event', 'Create Event');
  });
  document.getElementById('cancel-btn').addEventListener('click', resetForm);
  document.getElementById('event-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('event-list').addEventListener('click', handleListClick);
});
