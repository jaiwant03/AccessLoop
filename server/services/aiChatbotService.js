const Resource = require('../models/Resource');
const Booking = require('../models/Booking');

/**
 * Intelligent AccessLoop Assistant Engine
 * Adapts responses based on user role and queries real MongoDB collections.
 */
const processChatMessage = async ({ message, userRole, userId }) => {
  const query = (message || '').toLowerCase().trim();

  // 1. Resource Search / Discovery queries
  if (
    query.includes('find') ||
    query.includes('search') ||
    query.includes('available') ||
    query.includes('camera') ||
    query.includes('microscope') ||
    query.includes('3d printer') ||
    query.includes('lab') ||
    query.includes('computer') ||
    query.includes('equipment') ||
    query.includes('space')
  ) {
    let categoryFilter = {};
    if (query.includes('camera')) categoryFilter = { category: 'Cameras' };
    else if (query.includes('printer')) categoryFilter = { category: '3D Printers' };
    else if (query.includes('lab') || query.includes('laborator'))
      categoryFilter = { category: 'Laboratories' };
    else if (query.includes('computer') || query.includes('laptop'))
      categoryFilter = { category: { $in: ['Computers', 'Laptops'] } };
    else if (query.includes('microscope') || query.includes('instrument'))
      categoryFilter = { category: 'Scientific Instruments' };

    const resources = await Resource.find({
      isActive: true,
      ...categoryFilter,
    })
      .populate('owner', 'name email')
      .limit(3);

    if (resources.length > 0) {
      const resourceList = resources
        .map(
          (r) =>
            `• **${r.name}** (${r.category} | ${r.location}) - Status: ${r.availableQuantity > 0 ? 'Available' : 'Currently Reserved'}, Deposit: ₹${r.securityDeposit}`
        )
        .join('\n');

      return {
        reply: `Here are actual verified resources matching your inquiry:\n\n${resourceList}\n\nYou can click on any resource in **Explore Resources** to view full specifications, check eligibility, and submit a reservation request.`,
        resources: resources.map((r) => ({
          id: r._id,
          name: r.name,
          category: r.category,
          location: r.location,
          isAvailable: r.availableQuantity > 0,
        })),
        suggestions: [
          'How can I book a resource?',
          'What are the eligibility requirements?',
          'Check waiting list process',
        ],
      };
    }
  }

  // 2. Booking Process Explanation
  if (
    query.includes('how to book') ||
    query.includes('booking process') ||
    query.includes('book a resource') ||
    query.includes('how can i book')
  ) {
    return {
      reply: `Booking on AccessLoop follows a secure, trusted 5-step lifecycle:\n\n1. **Discover**: Find the space or equipment via the Explore page.\n2. **Verify Eligibility**: Check prerequisite training or department clearance.\n3. **Select Slot**: Pick your required date, time, and specify your intended purpose.\n4. **Owner Review**: The verified resource owner reviews and approves your request.\n5. **Check-in & Handover**: Document initial condition with photos upon collecting the resource.`,
      suggestions: [
        'How does check-in work?',
        'How does the waiting list work?',
        'Find a camera for my project',
      ],
    };
  }

  // 3. Waiting List Inquiry
  if (query.includes('waiting list') || query.includes('waitlist') || query.includes('queue')) {
    return {
      reply: `**How the Waiting List Works:**\n\nWhen a popular resource has overlapping reservations, you can join its queue.\n• The Fair Access Engine prioritizes users based on community usage scores.\n• If a reservation is cancelled or rejected, the next person in line is automatically notified and granted a 2-hour priority window to confirm.\n• You can view your real-time queue position in your Borrower Dashboard.`,
      suggestions: [
        'What is Fair Usage Score?',
        'How do I return borrowed equipment?',
        'Which laboratories are available?',
      ],
    };
  }

  // 4. Return Instructions
  if (query.includes('return') || query.includes('checkout') || query.includes('handover')) {
    return {
      reply: `**Return and Check-Out Protocol:**\n\n1. Open your active reservation in your **Dashboard**.\n2. Click **Request Return**.\n3. Take and upload clear photographs documenting the current condition of the resource.\n4. Provide any operational return notes (cleanliness, accessories packed).\n5. The resource owner inspects the returned item and confirms the completion.\n\n*Note: Self-marking an item completed without owner verification is disabled to ensure community accountability.*`,
      suggestions: [
        'How can I report damaged equipment?',
        'Why was my booking rejected?',
        'How to book a resource?',
      ],
    };
  }

  // 5. Damage / Incident Reporting
  if (
    query.includes('damage') ||
    query.includes('incident') ||
    query.includes('broken') ||
    query.includes('malfunction') ||
    query.includes('report')
  ) {
    return {
      reply: `**Damage & Incident Reporting:**\n\nIf you encounter equipment malfunction, damage, or scheduling conflicts:\n• Navigate to the **Incident Center** or click **Report Issue** from your booking page.\n• Select the category (e.g., Physical Damage, Malfunction, Late Return).\n• Upload photo evidence and a factual description.\n• Institution Managers and Resource Owners will investigate and facilitate transparent resolution.\n\n*Important: All incident decisions are overseen by human supervisors; automated penalties are never applied.*`,
      suggestions: [
        'How do I return borrowed equipment?',
        'What are the eligibility requirements?',
        'Find available 3D printers',
      ],
    };
  }

  // 6. Eligibility & Verification Questions
  if (
    query.includes('eligibility') ||
    query.includes('verify') ||
    query.includes('qualification') ||
    query.includes('training')
  ) {
    return {
      reply: `**Eligibility & Safety Verification:**\n\nTo ensure safety and equipment longevity, some specialized resources require:\n• **Verified Account Status**: Submit your Student/Faculty ID in Profile Settings.\n• **Safety Training**: Certain heavy machinery (CNC, Photolithography, Lasers) requires proof of workshop orientation.\n• **Minimum Fair Usage Score**: Keeps access equitable for all campus members.\n\nIf you lack a requirement, the booking modal highlights exactly what is missing and guides you to complete it.`,
      suggestions: [
        'How does the waiting list work?',
        'Which laboratories are available?',
        'How can I book a resource?',
      ],
    };
  }

  // 7. Rejection reasons
  if (query.includes('reject') || query.includes('why was my booking')) {
    return {
      reply: `**Understanding Booking Decisions:**\n\nResource owners review each request. Common reasons for rejection include:\n• Scheduling conflicts or unexpected maintenance.\n• Incomplete purpose statement.\n• Borrower did not hold required laboratory certifications.\n• Active concurrent booking limit reached.\n\nResource owners are required to provide a clear explanation for every rejection, which you can see in your booking details.`,
      suggestions: [
        'How can I book a resource?',
        'Find a camera for my project',
        'How does the waiting list work?',
      ],
    };
  }

  // 8. Owner Guidance (if user is owner or asking about listing)
  if (
    userRole === 'owner' ||
    query.includes('list resource') ||
    query.includes('add equipment') ||
    query.includes('how do i list')
  ) {
    return {
      reply: `**Resource Owner Guidance:**\n\nAs a resource custodian, you can:\n• **Add Resources**: Set operating hours, max duration, deposit, and safety criteria.\n• **Review Requests**: Approve, reject with notes, or waitlist requests.\n• **Handover**: Check initial condition photos before releasing equipment.\n• **Inspect Returns**: Verify that items return intact before closing bookings.\n• **Report Incidents**: Log missing parts or damages with photographic evidence.`,
      suggestions: [
        'How to list a new resource?',
        'How does return verification work?',
        'How do I handle damages?',
      ],
    };
  }

  // 9. Default Fallback
  return {
    reply: `I'm here to assist with AccessLoop resource sharing! You can ask me to find specific equipment or spaces, explain the 5-step booking process, guide you through check-in/return, explain eligibility criteria, or clarify waiting list positions.`,
    suggestions: [
      'Find a camera for my project',
      'Which laboratories are available?',
      'How can I book a resource?',
      'How do I return borrowed equipment?',
      'How does the waiting list work?',
    ],
  };
};

module.exports = { processChatMessage };
