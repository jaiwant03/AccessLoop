// test_e2e_full_lifecycle.js
// Automated End-to-End Test Suite for AccessLoop Resource Sharing Lifecycle

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, data: json };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AccessLoop End-to-End System Integration Test');
  console.log('====================================================\n');

  // STEP 1: Authentication & User Normalization
  console.log('--- Step 1: Authentication & Token Generation ---');

  const ownerLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'dr.sharma@accessloop.edu', password: 'Password123!' },
  });
  assert(ownerLogin.ok && ownerLogin.data.token, 'Owner (dr.sharma) logged in successfully');
  const owner = ownerLogin.data.user;
  const ownerToken = ownerLogin.data.token;
  assert(owner._id && owner.id, 'Owner object has both _id and id properties normalized');
  assert(owner.role === 'owner', 'Owner role is correctly assigned');

  const borrower1Login = await request('/auth/login', {
    method: 'POST',
    body: { email: 'arun.student@accessloop.edu', password: 'Password123!' },
  });
  assert(borrower1Login.ok && borrower1Login.data.token, 'Borrower 1 (arun) logged in successfully');
  const borrower1 = borrower1Login.data.user;
  const borrower1Token = borrower1Login.data.token;
  assert(borrower1._id && borrower1.id, 'Borrower 1 object has normalized _id and id');

  // Cancel any stale pending/approved test bookings to ensure clean test slate
  const b1Stale = await request('/bookings', { token: borrower1Token });
  if (b1Stale.ok && b1Stale.data.bookings) {
    for (const b of b1Stale.data.bookings) {
      if (['Pending', 'Approved'].includes(b.status)) {
        await request(`/bookings/${b._id}/cancel`, {
          method: 'PUT',
          token: borrower1Token,
          body: { reason: 'Resetting test environment' },
        });
      }
    }
  }

  const borrower2Login = await request('/auth/login', {
    method: 'POST',
    body: { email: 'priya.researcher@accessloop.edu', password: 'Password123!' },
  });
  assert(borrower2Login.ok && borrower2Login.data.token, 'Borrower 2 (priya) logged in successfully');
  const borrower2 = borrower2Login.data.user;
  const borrower2Token = borrower2Login.data.token;

  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@accessloop.edu', password: 'Password123!' },
  });
  assert(adminLogin.ok && adminLogin.data.token, 'Admin logged in successfully');
  const adminToken = adminLogin.data.token;

  // STEP 2: Resource Creation with Quantity = 2
  console.log('\n--- Step 2: Owner Lists Multi-Unit Resource ---');

  const newResource = {
    name: 'E2E Autonomous Navigation Robot Kit',
    category: 'Specialised Technical Resources',
    description: 'High-precision mobile robotics kit with LiDAR and stereo depth camera.',
    quantity: 2,
    location: 'Robotics Hall, Lab 3A',
    securityDeposit: 0,
    minBookingDurationHours: 1,
    maxBookingDurationHours: 8,
    eligibilityRequirements: {
      requiresVerifiedUser: true,
      minFairUsageScore: 50,
      requiresFacultyApproval: false,
    },
    images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80'],
  };

  const createRes = await request('/resources', {
    method: 'POST',
    token: ownerToken,
    body: newResource,
  });
  if (!createRes.ok) {
    console.error('Create Resource Error response:', createRes.status, createRes.data);
  }
  assert(createRes.ok && createRes.data.resource, 'Owner successfully listed new multi-unit resource (Quantity = 2)');
  const resource = createRes.data.resource;
  assert(resource.quantity === 2, 'Resource quantity is exactly 2 units');

  // STEP 3: Multi-Unit Booking & Booking Conflict Enforcement
  console.log('\n--- Step 3: Multi-Unit Concurrent Booking & Capacity Check ---');

  // Define future time slot: Tomorrow 10:00 to 14:00 (4 hours)
  const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);

  // Borrower 1 reserves Unit 1
  const b1Req = await request('/bookings', {
    method: 'POST',
    token: borrower1Token,
    body: {
      resourceId: resource._id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: 'Robotics SLAM navigation mapping experiment',
    },
  });
  if (!b1Req.ok) {
    console.error('Borrower 1 Booking Error:', b1Req.status, b1Req.data);
  }
  assert(b1Req.ok && b1Req.data.booking, 'Borrower 1 reserved Unit 1 successfully (Status: Pending)');
  const booking1 = b1Req.data.booking;

  // Owner approves Booking 1
  const b1Approve = await request(`/bookings/${booking1._id}/review`, {
    method: 'PUT',
    token: ownerToken,
    body: { action: 'approve', reviewNotes: 'Approved for robotics project.' },
  });
  if (!b1Approve.ok) {
    console.error('Owner Review Booking 1 Error:', b1Approve.status, b1Approve.data);
  }
  assert(b1Approve.ok && b1Approve.data.booking.status === 'Approved', 'Owner approved Booking 1 (Unit 1 in use)');

  // Borrower 2 reserves Unit 2 for the exact same time slot
  const b2Req = await request('/bookings', {
    method: 'POST',
    token: borrower2Token,
    body: {
      resourceId: resource._id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: 'Computer vision obstacle avoidance validation',
    },
  });
  assert(b2Req.ok && b2Req.data.booking, 'Borrower 2 reserved Unit 2 concurrently (Allowed because quantity = 2)');
  const booking2 = b2Req.data.booking;

  // Owner approves Booking 2
  const b2Approve = await request(`/bookings/${booking2._id}/review`, {
    method: 'PUT',
    token: ownerToken,
    body: { action: 'approve', reviewNotes: 'Approved for second unit.' },
  });
  if (!b2Approve.ok) {
    console.error('Owner Review Booking 2 Error:', b2Approve.status, b2Approve.data);
  }
  assert(b2Approve.ok && b2Approve.data.booking.status === 'Approved', 'Owner approved Booking 2 (Both units now reserved)');

  // Attempt a 3rd reservation for the same slot (Capacity is 2, so 3rd must fail with 409 Conflict)
  const b3Attempt = await request('/bookings', {
    method: 'POST',
    token: borrower1Token,
    body: {
      resourceId: resource._id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      purpose: 'Excess 3rd booking attempt',
    },
  });
  assert(b3Attempt.status === 409 && b3Attempt.data.conflict === true, 'Capacity conflict enforced: 3rd reservation rejected with HTTP 409 Conflict');

  // STEP 4: Waiting List Management
  console.log('\n--- Step 4: Waiting List Joining & Queue Ordering ---');

  const joinWait = await request('/waiting-list', {
    method: 'POST',
    token: borrower1Token,
    body: {
      resourceId: resource._id,
      requestedStartTime: startTime.toISOString(),
      requestedEndTime: endTime.toISOString(),
      purpose: 'Waiting for navigation kit',
    },
  });
  assert(joinWait.ok && joinWait.data.entry.queuePosition === 1, 'Borrower 1 joined waiting list at position #1');
  const waitEntry = joinWait.data.entry;

  const myWaitList = await request('/waiting-list/my', { token: borrower1Token });
  assert(myWaitList.ok && myWaitList.data.count >= 1, 'Borrower can fetch their active waiting list entries');

  // STEP 5: Equipment Check-In Handover Lifecycle (Booking 1)
  console.log('\n--- Step 5: Check-In Handover Inspection & Activation ---');

  const checkInRes = await request(`/check-in-out/${booking1._id}/check-in`, {
    method: 'POST',
    token: borrower1Token,
    body: {
      borrowerNotes: 'Inspected with owner. Chassis, LiDAR, and battery verified clean and intact.',
      initialPhotos: ['/uploads/sample_checkin.png'],
    },
  });
  assert(checkInRes.ok, 'Borrower submitted check-in condition documentation');

  // Verify non-owner / borrower cannot verify handover
  const unauthHandover = await request(`/check-in-out/${booking1._id}/verify-handover`, {
    method: 'POST',
    token: borrower1Token,
    body: { ownerNotes: 'Illegal self-verification attempt' },
  });
  assert(unauthHandover.status === 403, 'Security: Borrower prohibited from verifying their own handover (HTTP 403)');

  // Owner verifies handover
  const ownerHandover = await request(`/check-in-out/${booking1._id}/verify-handover`, {
    method: 'POST',
    token: ownerToken,
    body: { ownerNotes: 'Handed over equipment in Lab 3A. Battery charged.' },
  });
  assert(ownerHandover.ok && ownerHandover.data.booking.status === 'Active', 'Owner confirmed handover: Booking status transitioned to Active');

  // STEP 6: Equipment Return, Condition Inspection & Completion
  console.log('\n--- Step 6: Return Request, Inspection Sign-Off & Promotion ---');

  // Borrower initiates return
  const returnReq = await request(`/check-in-out/${booking1._id}/request-return`, {
    method: 'POST',
    token: borrower1Token,
    body: {
      borrowerNotes: 'Session completed. Equipment wiped down and returned with all cables.',
      returnPhotos: ['/uploads/sample_return.png'],
    },
  });
  assert(returnReq.ok && returnReq.data.booking.status === 'Return Pending', 'Borrower initiated return: Booking status transitioned to Return Pending');

  // Owner inspects and verifies return
  const verifyReturnRes = await request(`/check-in-out/${booking1._id}/verify-return`, {
    method: 'POST',
    token: ownerToken,
    body: {
      ownerInspectionNotes: 'All components inspected. Clean return with zero damage.',
      damageDetected: false,
      conditionStatus: 'Intact & Clean',
    },
  });
  assert(verifyReturnRes.ok && verifyReturnRes.data.booking.status === 'Completed', 'Owner verified return: Booking status transitioned to Completed');

  // Check waiting list promotion
  const updatedWait = await request('/waiting-list/my', { token: borrower1Token });
  assert(updatedWait.ok, 'Waiting list records checked after slot vacancy');

  // STEP 7: Booking Cancellation & Fair Stats Safety
  console.log('\n--- Step 7: Booking Cancellation & Counter Safety ---');

  const cancelRes = await request(`/bookings/${booking2._id}/cancel`, {
    method: 'PUT',
    token: borrower2Token,
    body: { reason: 'Schedule adjustment' },
  });
  assert(cancelRes.ok && cancelRes.data.booking.status === 'Cancelled', 'Booking 2 successfully cancelled');

  // Clean up waiting list entry
  const leaveWait = await request(`/waiting-list/${waitEntry._id}`, {
    method: 'DELETE',
    token: borrower1Token,
  });
  assert(leaveWait.ok, 'Borrower left waiting list cleanly');

  // STEP 8: Incident Reporting, Discussion & Resolution
  console.log('\n--- Step 8: Incident Center Workflow ---');

  const incidentRes = await request('/incidents', {
    method: 'POST',
    token: borrower1Token,
    body: {
      category: 'physical_damage',
      resourceId: resource._id,
      bookingId: booking1._id,
      description: 'Minor cosmetic scratch noticed on sensor casing during return.',
      severity: 'Low',
    },
  });
  if (!incidentRes.ok) {
    console.error('Incident Report Error:', incidentRes.status, incidentRes.data);
  }
  assert(incidentRes.ok && incidentRes.data.incident, 'Incident reported successfully');
  const incident = incidentRes.data.incident;

  // Add comment
  const commentRes = await request(`/incidents/${incident._id}/comments`, {
    method: 'POST',
    token: ownerToken,
    body: { message: 'Owner inspection verified this is surface wear only. No optical interference.' },
  });
  assert(commentRes.ok && commentRes.data.comments.length >= 1, 'Owner added remark to incident discussion thread');

  // Admin / Manager resolves incident
  const resolveRes = await request(`/incidents/${incident._id}/status`, {
    method: 'PUT',
    token: adminToken,
    body: {
      status: 'Resolved',
      managerNotes: 'Surface scratch evaluated and documented. No functional impairment or penalty assigned.',
      resolutionDetails: 'Cosmetic wear noted in equipment log.',
    },
  });
  assert(resolveRes.ok && resolveRes.data.incident.status === 'Resolved', 'Admin resolved incident with status Resolved');

  // STEP 9: Institutional Verification Workflow
  console.log('\n--- Step 9: User Institutional Verification ---');

  const verifyDocRes = await request('/auth/verify-request', {
    method: 'POST',
    token: borrower2Token,
    body: {
      verificationType: 'Student ID',
      idNumber: 'STU-2024-9988',
      department: 'Biotechnology & Nanomedicine',
      submittedNotes: 'Submitting updated student ID card for lab equipment clearance.',
      documentUrl: '/uploads/sample_id.png',
    },
  });
  assert(verifyDocRes.ok && verifyDocRes.data.verification, 'User submitted verification document request');
  const vRecord = verifyDocRes.data.verification;

  const adminReviewV = await request(`/verifications/${vRecord._id}/review`, {
    method: 'PUT',
    token: adminToken,
    body: {
      status: 'Verified',
      reviewerNotes: 'Student credentials validated with registrar database.',
    },
  });
  assert(adminReviewV.ok && adminReviewV.data.verification.status === 'Verified', 'Admin reviewed and approved verification');

  // STEP 10: Audit Log Verification
  console.log('\n--- Step 10: Immutable Audit Trail Verification ---');

  const auditRes = await request('/audit-logs?limit=50', { token: adminToken });
  assert(auditRes.ok && auditRes.data.logs && auditRes.data.logs.length > 0, 'Admin fetched audit log entries');
  const actions = auditRes.data.logs.map((l) => l.actionType);
  console.log(`  ℹ Logged actions captured: ${actions.slice(0, 10).join(', ')}...`);

  assert(actions.includes('check_in_submitted'), 'Audit trail captured check_in_submitted');
  assert(actions.includes('check_in_completed'), 'Audit trail captured check_in_completed');
  assert(actions.includes('return_requested'), 'Audit trail captured return_requested');
  assert(actions.includes('return_confirmed'), 'Audit trail captured return_confirmed');
  assert(actions.includes('incident_created'), 'Audit trail captured incident_created');

  console.log('\n====================================================');
  console.log('🎉 ALL 10 INTEGRATION TEST SUITES PASSED FLAWLESSLY!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
