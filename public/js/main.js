// Shared homepage behaviour: mobile nav toggle, loading real events
// from the API (Part 2), reflecting login state — including the
// manager-only Dashboard link — and a friendly (non-sending)
// contact form.

// Builds one event card. The "seam" div + two small circles are
// the ticket-stub effect: the circles are colored to match the
// page background behind the card, so they read as punched-out
// notches rather than solid dots.
function createEventCard(event) {
  const price = Number(event.ticket_price);
  const priceLabel = price === 0 ? 'Free' : `$${price}`;
  const dateLabel = new Date(event.event_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const imageUrl = `/images/${event.image || 'event-placeholder-1.jpg'}`;
  const rating = Number(event.rating);
  const ratingLabel = rating > 0 ? `&#9733; ${rating.toFixed(1)}` : 'New';

  return `
    <div class="bg-paper rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div class="h-36 bg-moss-100 bg-cover bg-center" style="background-image:url('${imageUrl}')"></div>
      <div class="px-4 pt-4 pb-3">
        <span class="font-stub text-[11px] tracking-widest uppercase text-moss bg-moss-100 px-2 py-1 rounded">
          ${event.category}
        </span>
        <h3 class="font-display font-semibold text-ink text-lg mt-2 leading-snug">${event.title}</h3>
        <p class="text-sm text-ink/60 mt-1">${event.location} &middot; ${dateLabel}</p>
      </div>
      <div class="relative border-t-2 border-dashed border-ink/15 mx-4">
        <span class="absolute -left-6 -top-3 w-6 h-6 rounded-full bg-cloth"></span>
        <span class="absolute -right-6 -top-3 w-6 h-6 rounded-full bg-cloth"></span>
      </div>
      <div class="flex items-center justify-between px-4 py-3 font-stub text-sm">
        <span class="text-ember font-bold">${priceLabel}</span>
        <span class="text-marigold">${ratingLabel}</span>
      </div>
    </div>`;
}

function renderEmptyState(container, message) {
  container.innerHTML = `<p class="col-span-full text-center text-ink/60 py-10">${message}</p>`;
}

// Tries the real API first (Part 2). Falls back to placeholder data
// only if the request itself fails — not if it succeeds with zero
// events, which gets its own empty state instead.
async function fetchEvents() {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Request failed');
    return await response.json();
  } catch (err) {
    console.warn('Could not load events from the API, showing sample data instead.', err);
    return SAMPLE_EVENTS;
  }
}

async function renderEventSections() {
  const featuredEl = document.getElementById('featured-events');
  const upcomingEl = document.getElementById('upcoming-events');
  if (!featuredEl && !upcomingEl) return; // not on this page (e.g. dashboard.html)

  const events = await fetchEvents();

  if (events.length === 0) {
    const message = 'No events posted yet — <a href="/register.html" class="text-ember underline">register as a manager</a> and be the first!';
    if (featuredEl) renderEmptyState(featuredEl, message);
    if (upcomingEl) renderEmptyState(upcomingEl, message);
    return;
  }

  const byRating = [...events].sort((a, b) => Number(b.rating) - Number(a.rating));
  const byDate = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  if (featuredEl) featuredEl.innerHTML = byRating.slice(0, 3).map(createEventCard).join('');
  if (upcomingEl) upcomingEl.innerHTML = byDate.slice(0, 3).map(createEventCard).join('');
}

function reflectAuthState() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const guestLinks = document.getElementById('guest-links');
  const userLinks = document.getElementById('user-links');
  if (!guestLinks || !userLinks) return; // not on this page (e.g. login.html)

  if (token) {
    guestLinks.classList.add('hidden');
    userLinks.classList.remove('hidden');
    const nameEl = document.getElementById('nav-user-name');
    if (nameEl) nameEl.textContent = localStorage.getItem('fullName') || 'Account';

    // Only managers get a Dashboard link — a regular user has nothing to do there.
    const dashLink = document.getElementById('nav-dashboard-link');
    if (dashLink) dashLink.classList.toggle('hidden', role !== 'manager');
  } else {
    guestLinks.classList.remove('hidden');
    userLinks.classList.add('hidden');
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('fullName');
  window.location.href = '/index.html';
}

function setupMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
}

// The contact form has no backend endpoint on purpose — email
// notifications are outside this project's scope — so this just
// gives visible, honest feedback instead of failing silently.
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const message = document.getElementById('contact-message');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    message.textContent = "Thanks — this demo form doesn't send messages yet, but the UI is ready for a real endpoint later.";
    message.classList.remove('hidden');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  reflectAuthState();
  renderEventSections();
  setupContactForm();

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
