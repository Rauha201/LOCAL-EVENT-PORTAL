// My Registrations page — user-only. Same "UX guard, not security
// boundary" pattern as dashboard.js: the real check is
// authorize('user') on GET /api/registrations/mine.

const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'user') {
  window.location.href = '/login.html';
}

function createRegistrationRow(reg) {
  const price = Number(reg.ticket_price);
  const priceLabel = price === 0 ? 'Free' : `$${price}`;
  return `
    <a href="/event.html?id=${reg.event_id}" class="block bg-paper rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <span class="font-stub text-[11px] uppercase tracking-widest text-moss">${reg.category}</span>
      <h3 class="font-display font-semibold text-lg leading-snug">${reg.title}</h3>
      <p class="text-sm text-ink/60">${reg.location} &middot; ${formatDateLong(reg.event_date)} &middot; ${priceLabel}</p>
      <span class="inline-block mt-1 text-xs font-stub uppercase tracking-wide text-moss">Payment: ${reg.payment_status}</span>
    </a>`;
}

async function loadRegistrations() {
  const listEl = document.getElementById('registrations-list');
  const emptyEl = document.getElementById('empty-state');

  try {
    const res = await fetch('/api/registrations/mine', { headers: { Authorization: `Bearer ${token}` } });
    const registrations = await res.json();
    if (!res.ok) throw new Error(registrations.message || 'Could not load your registrations');

    if (registrations.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
    } else {
      emptyEl.classList.add('hidden');
      listEl.innerHTML = registrations.map(createRegistrationRow).join('');
    }
  } catch (err) {
    listEl.innerHTML = `<p class="text-red-600 text-center py-8">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadRegistrations);
