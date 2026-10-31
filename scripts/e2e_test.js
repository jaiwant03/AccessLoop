// End-to-End test script for AccessLoop core workflow
// Run with: node scripts/e2e_test.js

const axios = require('axios');
const io = require('socket.io-client');

const API = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 10000 });

// Helper to pause
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  console.log('--- ACCESSLOOP E2E TEST START ---');
  // 1. Login demo accounts (owner & borrower)
  const ownerAcc = await API.post('/auth/login', { email: 'dr.sharma@accessloop.edu', password: 'Password123!' });
  const borrowerAcc = await API.post('/auth/login', { email: 'arun.student@accessloop.edu', password: 'Password123!' });

  const ownerToken = ownerAcc.data.token;
  const borrowerToken = borrowerAcc.data.token;

  // 2. Owner creates a resource
  const resourcePayload = {
    name: 'Robotics Lab Kit',
    category: 'Lab Equipment',
    description: 'A set of robotics components for projects.',
    images: [], // assuming API accepts empty array for now
    institution: 'Engineering College',
    location: 'Room 101',
    quantity: 2,
    availability: [{ start: new Date().toISOString(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }],
    eligibility: { requiredRoles: ['borrower'] },
    trainingRequired: false,
    usageConditions: 'Return in same condition',
    isFree: true,
  };

  const createRes = await API.post('/resources', resourcePayload, { headers: { Authorization: `Bearer ${ownerToken}` } });
  const resourceId = createRes.data.resource._id;
  console.log('Resource created:', resourceId);

  // 3. Borrower discovers resource
  const searchRes = await API.get('/resources', { params: { q: 'Robotics' }, headers: { Authorization: `Bearer ${borrowerToken}` } });
  console.log('Search returned', searchRes.data.resources.length, 'resources');

  // 4. Borrower requests booking
  const bookingPayload = {
    resourceId,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Project prototype',
    notes: 'Need for 2 days',
  };

  const bookingRes = await API.post('/bookings', bookingPayload, { headers: { Authorization: `Bearer ${borrowerToken}` } });
  const bookingId = bookingRes.data.booking._id;
  console.log('Booking request created:', bookingId);

  // 5. Owner approves booking via API (simulating UI action)
  const approveRes = await API.put(`/bookings/${bookingId}/approve`, {}, { headers: { Authorization: `Bearer ${ownerToken}` } });
  console.log('Booking approved, status:', approveRes.data.booking.status);

  // 6. Borrower checks in (upload dummy condition - omitted)
  const checkInRes = await API.put(`/check-in-out/${bookingId}/check-in`, {}, { headers: { Authorization: `Bearer ${borrowerToken}` } });
  console.log('Check‑in status:', checkInRes.data.booking.status);

  // 7. Borrower returns resource
  const returnRes = await API.put(`/check-in-out/${bookingId}/return`, {}, { headers: { Authorization: `Bearer ${borrowerToken}` } });
  console.log('Return request status:', returnRes.data.booking.status);

  // 8. Owner completes return verification
  const completeRes = await API.put(`/bookings/${bookingId}/complete`, {}, { headers: { Authorization: `Bearer ${ownerToken}` } });
  console.log('Booking completed status:', completeRes.data.booking.status);

  // 9. Verify audit log entry exists
  const auditRes = await API.get('/audit-logs', { headers: { Authorization: `Bearer ${ownerToken}` } });
  const auditExists = auditRes.data.logs.some(l => l.bookingId === bookingId);
  console.log('Audit log entry present:', auditExists);

  // 10. Test real‑time notification via socket.io
  const socket = io('http://localhost:5000', { transports: ['websocket'], auth: { token: borrowerToken } });
  socket.on('connect', () => console.log('Socket connected for borrower'));
  socket.on('notification:new', (data) => console.log('Borrower received notification:', data));
  // Simulate a new booking request to trigger notification
  const anotherBooking = await API.post('/bookings', bookingPayload, { headers: { Authorization: `Bearer ${borrowerToken}` } });
  await wait(2000);
  socket.disconnect();

  console.log('--- ACCESSLOOP E2E TEST COMPLETED ---');
})().catch((err) => {
  console.error('E2E test failed:', err.response ? err.response.data : err.message);
  process.exit(1);
});

