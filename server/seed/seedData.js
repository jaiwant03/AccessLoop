require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Institution = require('../models/Institution');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const WaitingList = require('../models/WaitingList');
const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Verification = require('../models/Verification');

const seedData = async () => {
  try {
    console.log('[Seed] Starting database seeding process...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Institution.deleteMany({}),
      Resource.deleteMany({}),
      Booking.deleteMany({}),
      WaitingList.deleteMany({}),
      Incident.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Verification.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing records.');

    // 1. Seed Institution
    const institution = await Institution.create({
      name: 'Apex Institute of Technology & Science',
      code: 'AITS-MAIN',
      address: 'Innovation Campus, Block B, Tech Corridor',
      contactEmail: 'resources@apex.edu',
      phone: '+91 80 2345 6789',
      website: 'https://apex.edu',
      allowedEmailDomains: ['apex.edu', 'accessloop.edu'],
      policies: {
        maxSimultaneousBookingsPerBorrower: 3,
        maxAdvanceBookingDays: 14,
        requireSupervisionDefault: false,
      },
    });
    console.log('[Seed] Created Institution: Apex Institute of Technology & Science');

    // 2. Seed Users
    const users = await User.create([
      {
        name: 'Administrator',
        email: 'admin@accessloop.edu',
        password: 'Password123!',
        role: 'admin',
        institution: institution.name,
        department: 'Central Administration',
        studentOrEmployeeId: 'ADM-001',
        verificationStatus: 'Verified',
        fairUsageScore: 100,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Dr. Evelyn Vance (Manager)',
        email: 'manager@accessloop.edu',
        password: 'Password123!',
        role: 'manager',
        institution: institution.name,
        department: 'Academic Resource Oversight',
        studentOrEmployeeId: 'MGR-104',
        verificationStatus: 'Verified',
        fairUsageScore: 100,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Dr. Ramesh Sharma',
        email: 'dr.sharma@accessloop.edu',
        password: 'Password123!',
        role: 'owner',
        institution: institution.name,
        department: 'Robotics & Automation',
        studentOrEmployeeId: 'FAC-201',
        verificationStatus: 'Verified',
        fairUsageScore: 98,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Prof. Maya Sen',
        email: 'media.prof@accessloop.edu',
        password: 'Password123!',
        role: 'owner',
        institution: institution.name,
        department: 'Digital Arts & Media Lab',
        studentOrEmployeeId: 'FAC-312',
        verificationStatus: 'Verified',
        fairUsageScore: 95,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'John Reynolds',
        email: 'lab.tech@accessloop.edu',
        password: 'Password123!',
        role: 'owner',
        institution: institution.name,
        department: 'Optics & Precision Engineering Core',
        studentOrEmployeeId: 'STF-508',
        verificationStatus: 'Verified',
        fairUsageScore: 100,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Arun Kumar',
        email: 'arun.student@accessloop.edu',
        password: 'Password123!',
        role: 'borrower',
        institution: institution.name,
        department: 'Mechanical Engineering',
        studentOrEmployeeId: 'STU-2023-8801',
        verificationStatus: 'Verified',
        fairUsageScore: 92,
        totalHoursUsed: 18,
        completedBookingsCount: 4,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Priya Menon',
        email: 'priya.researcher@accessloop.edu',
        password: 'Password123!',
        role: 'borrower',
        institution: institution.name,
        department: 'Biotechnology & Nanomedicine',
        studentOrEmployeeId: 'RES-2024-4102',
        verificationStatus: 'Verified',
        fairUsageScore: 96,
        totalHoursUsed: 28,
        completedBookingsCount: 6,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Kavya Nair',
        email: 'kavya.creator@accessloop.edu',
        password: 'Password123!',
        role: 'borrower',
        institution: institution.name,
        department: 'Journalism & Media',
        studentOrEmployeeId: 'STU-2023-9114',
        verificationStatus: 'Verified',
        fairUsageScore: 88,
        totalHoursUsed: 12,
        completedBookingsCount: 3,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.maker@accessloop.edu',
        password: 'Password123!',
        role: 'borrower',
        institution: institution.name,
        department: 'Electrical & Electronics',
        studentOrEmployeeId: 'STU-2024-3321',
        verificationStatus: 'Pending Review',
        fairUsageScore: 78,
        totalHoursUsed: 6,
        completedBookingsCount: 1,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.engineer@accessloop.edu',
        password: 'Password123!',
        role: 'borrower',
        institution: institution.name,
        department: 'Computer Science & AI',
        studentOrEmployeeId: 'STU-2024-7740',
        verificationStatus: 'Not Submitted',
        fairUsageScore: 100,
        totalHoursUsed: 0,
        completedBookingsCount: 0,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      },
    ]);
    console.log(`[Seed] Seeded ${users.length} users with diverse roles & verification states.`);

    const ownerSharma = users.find((u) => u.email === 'dr.sharma@accessloop.edu');
    const ownerMaya = users.find((u) => u.email === 'media.prof@accessloop.edu');
    const ownerJohn = users.find((u) => u.email === 'lab.tech@accessloop.edu');
    const borrowerArun = users.find((u) => u.email === 'arun.student@accessloop.edu');
    const borrowerPriya = users.find((u) => u.email === 'priya.researcher@accessloop.edu');
    const borrowerKavya = users.find((u) => u.email === 'kavya.creator@accessloop.edu');
    const borrowerRahul = users.find((u) => u.email === 'rahul.maker@accessloop.edu');

    // 3. Seed 16 Realistic Resources
    const resourcesData = [
      {
        name: 'Sony Alpha A7 IV Full-Frame Cinema & Photo Kit',
        category: 'Cameras',
        resourceType: 'equipment',
        description:
          'Professional 33MP hybrid full-frame mirrorless camera with FE 24-70mm f/2.8 GM lens, dual SD cards, 3 batteries, Sennheiser wireless lavalier mic, and heavy-duty carbon tripod.',
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Digital Arts & Media Lab',
        location: 'Media Center, Room 104, Cabinet C',
        owner: ownerMaya._id,
        quantity: 2,
        availableQuantity: 2,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 24,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 70,
          requiresTraining: false,
          requiresSupervision: false,
        },
        safetyInstructions: 'Keep lens cap on when not shooting. Never expose sensor to direct laser light. Use padded shoulder strap at all times.',
        usageGuidelines: 'Format SD cards only after backing up footage. Recharge batteries before return.',
        securityDeposit: 2500,
        isPaid: false,
        cancellationPolicy: 'Free cancellation up to 2 hours before slot start.',
        condition: 'Excellent',
        tags: ['camera', 'sony', '4k', 'filmmaking', 'photography', 'dslr'],
        totalBookingsCount: 19,
        rating: 4.95,
      },
      {
        name: 'Olympus BX53 Fluorescence Research Microscope',
        category: 'Scientific Instruments',
        resourceType: 'equipment',
        description:
          'High-end upright clinical and biological research microscope featuring multi-wavelength LED fluorescence, Plan Apochromat 4x, 10x, 40x, 100x oil immersion optics, and cooled CMOS imaging sensor.',
        images: [
          'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Biotechnology Core',
        location: 'Biomedical Block, 3rd Floor, Bio-Imaging Lab 308',
        owner: ownerJohn._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 6,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 60,
          requiresTraining: true,
          trainingCourseName: 'Fluorescence Microscopy Calibration & Bio-safety Level 2',
          requiresSupervision: false,
        },
        safetyInstructions: 'Ensure mercury burner exhaust is clear. Do not leave immersion oil on objectives after session.',
        usageGuidelines: 'Store slide specimens in designated holders. Log lamp hours in instrument ledger.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['microscope', 'fluorescence', 'biology', 'imaging', 'olympus'],
        totalBookingsCount: 14,
        rating: 4.9,
      },
      {
        name: 'Ultimaker S5 Industrial Dual-Extrusion 3D Printer',
        category: '3D Printers',
        resourceType: 'equipment',
        description:
          'Large build volume (330 x 240 x 300 mm) composite-ready 3D printer with active bed leveling, dual nozzles for water-soluble PVA support, and automated material station.',
        images: [
          'https://images.unsplash.com/photo-1631557559471-ae6076955146?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Robotics & Automation',
        location: 'Innovation Garage, Bay 2, Station 04',
        owner: ownerSharma._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 12,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 50,
          requiresTraining: true,
          trainingCourseName: 'UltiMaker Cura Slicing & Bed Safety Orientation',
        },
        safetyInstructions: 'Do not touch hot end (260°C). Wait until heated glass bed reaches below 40°C before removing prints.',
        usageGuidelines: 'Supply your own certified PLA/PETG filament or purchase institutional spools at cost.',
        securityDeposit: 500,
        isPaid: false,
        condition: 'Good',
        tags: ['3d-printing', 'rapid-prototyping', 'ultimaker', 'cad', 'maker'],
        totalBookingsCount: 26,
        rating: 4.88,
      },
      {
        name: 'Advanced Photonics & Ultra-Fast Laser Lab',
        category: 'Laboratories',
        resourceType: 'space',
        description:
          'Optically isolated darkroom equipped with vibration-isolated optical breadboard, femtosecond laser source, beam splitters, spectrometer, and laser safety interlock enclosures.',
        images: [
          'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Optics & Precision Engineering Core',
        location: 'Science Tower, Basement B2, Suite 012',
        owner: ownerJohn._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 8,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 75,
          requiresTraining: true,
          trainingCourseName: 'Class 4 Laser Safety Certification',
          requiresSupervision: true,
          supervisorName: 'Dr. John Reynolds / Authorized Research Fellow',
        },
        safetyInstructions: 'Mandatory Class 4 optical density 7+ protective goggles required before activating laser beam.',
        usageGuidelines: 'Maintain temperature controlled at 20°C. No reflective jewelry permitted inside optical perimeter.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['laser', 'photonics', 'optics', 'physics', 'clean-space'],
        totalBookingsCount: 8,
        rating: 5.0,
      },
      {
        name: 'NVIDIA DGX GPU Deep Learning Cluster Node',
        category: 'Computers',
        resourceType: 'equipment',
        description:
          'Server workstation equipped with 4x NVIDIA A100 80GB Tensor Core GPUs, dual AMD EPYC 64-core processors, 1TB ECC DDR4 RAM, and 15TB NVMe scratch storage for LLM fine-tuning and computer vision.',
        images: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Computer Science & AI',
        location: 'High Performance Computing Data Center, Rack 14',
        owner: ownerSharma._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 48,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 65,
          requiresTraining: false,
        },
        safetyInstructions: 'Remote SSH and JupyterHub access only. Do not overload thermal thresholds above 85°C.',
        usageGuidelines: 'Store datasets in /scratch partition. Clean temporary checkpoint artifacts after execution.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['gpu', 'ai', 'deep-learning', 'nvidia', 'hpc', 'cuda'],
        totalBookingsCount: 42,
        rating: 4.97,
      },
      {
        name: 'Keysight 4-Channel 1GHz Digital Storage Oscilloscope',
        category: 'Testing Devices',
        resourceType: 'equipment',
        description:
          'InfiniiVision 3000G X-Series 1GHz 4-channel DSO with integrated 20MHz arbitrary waveform generator, protocol decoding (I2C, SPI, CAN, UART), and 5GSa/s real-time sample rate.',
        images: [
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Robotics & Automation',
        location: 'ECE Lab, Bench 06',
        owner: ownerSharma._id,
        quantity: 3,
        availableQuantity: 3,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 8,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 50,
          requiresTraining: false,
        },
        safetyInstructions: 'Verify probe ground clips are not connected to live high voltage rails.',
        usageGuidelines: 'Calibrate probes prior to measurements. Return 10:1 passive probes into pouch.',
        securityDeposit: 1000,
        isPaid: false,
        condition: 'Excellent',
        tags: ['electronics', 'oscilloscope', 'testing', 'hardware', 'keysight'],
        totalBookingsCount: 17,
        rating: 4.85,
      },
      {
        name: 'Haas Mini Mill 3-Axis CNC Machining Center',
        category: 'Fabrication Tools',
        resourceType: 'equipment',
        description:
          'High precision metal and acrylic milling center with 40-taper spindle (6000 RPM), 10-tool automatic changer, and rigid tapping for prototype parts and enclosures.',
        images: [
          'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Mechanical Engineering',
        location: 'Central Fabrication Shop, Machine Bay 01',
        owner: ownerSharma._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 6,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 80,
          requiresTraining: true,
          trainingCourseName: 'CNC CAM G-Code & Shop Floor Safety Operator License',
          requiresSupervision: true,
          supervisorName: 'Master Machinist Workshop Officer',
        },
        safetyInstructions: 'Full eye protection, steel-toe footwear, and hair tied back mandatory. Emergency stop must be within arm reach.',
        usageGuidelines: 'Submit CAM simulation file for clearance before turning spindle on.',
        securityDeposit: 3000,
        isPaid: false,
        condition: 'Good',
        tags: ['cnc', 'machining', 'fabrication', 'metalwork', 'prototyping'],
        totalBookingsCount: 9,
        rating: 4.92,
      },
      {
        name: 'Spatial Computing & HoloLens VR/AR Interaction Studio',
        category: 'Makerspaces',
        resourceType: 'space',
        description:
          '1000 sq ft dedicated mixed-reality capture studio with ceiling optical tracking cameras, 4x Meta Quest Pro headsets, Microsoft HoloLens 2, and high-refresh wireless streaming network.',
        images: [
          'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Digital Arts & Media Lab',
        location: 'Tech Innovation Hub, 2nd Floor, Room 210',
        owner: ownerMaya._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 4,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 60,
          requiresTraining: false,
        },
        safetyInstructions: 'Sanitize VR headsets with UV box before and after use. Keep perimeter free of physical trip hazards.',
        usageGuidelines: 'Store controllers in charging docks. Do not leave headsets in direct sunlight.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['vr', 'ar', 'metaverse', 'unity', 'unreal', 'interaction'],
        totalBookingsCount: 15,
        rating: 4.91,
      },
      {
        name: 'Broadcast Acoustics Soundproof Recording & Podcast Suite',
        category: 'Audio Equipment',
        resourceType: 'space',
        description:
          'Fully isolated double-walled sound booth featuring Shure SM7B dynamic microphones, Cloudlifter preamps, RØDECaster Pro II console, Beyerdynamic DT 770 Pro headphones, and Logic Pro / Audition DAW workstation.',
        images: [
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Digital Arts & Media Lab',
        location: 'Media Center, Lower Ground, Studio B',
        owner: ownerMaya._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 5,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 50,
          requiresTraining: false,
        },
        safetyInstructions: 'No food or unsealed liquids inside the sound booth. Handle shock mounts gently.',
        usageGuidelines: 'Export audio stems to personal drive before logging out. Reset mixer faders to zero.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['audio', 'podcast', 'recording', 'studio', 'shure', 'soundproof'],
        totalBookingsCount: 31,
        rating: 4.96,
      },
      {
        name: 'DJI Ronin 4D 6K Cinema Camera & Gimbal Rig',
        category: 'Cameras',
        resourceType: 'equipment',
        description:
          '4-axis stabilized cinematography system with full-frame Zenmuse X9-6K camera, LiDAR rangefinder autofocus, wireless video transmitter, and monitor combo.',
        images: [
          'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Digital Arts & Media Lab',
        location: 'Media Center, Equipment Locker #03',
        owner: ownerMaya._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 10,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 85,
          requiresTraining: true,
          trainingCourseName: 'Advanced Cinema Gimbal Balancing & Calibration',
          requiresSupervision: false,
        },
        safetyInstructions: 'Balance all 4 axes mechanically before switching motor power on to prevent motor burn.',
        usageGuidelines: 'Keep in pelican hard-case during transit. Handle LiDAR sensor with micro-fiber cloth only.',
        securityDeposit: 5000,
        isPaid: false,
        condition: 'Excellent',
        tags: ['cinema', 'dji', 'gimbal', '6k', 'filmmaking', 'stabilizer'],
        totalBookingsCount: 11,
        rating: 4.98,
      },
      {
        name: 'LPKF ProtoMat S64 High-Precision PCB Milling Station',
        category: 'Fabrication Tools',
        resourceType: 'equipment',
        description:
          'Laboratory circuit board plotter for chemical-free prototyping of single and double-sided RF/microwave PCBs with automatic 15-tool changer and 60000 RPM high-speed spindle.',
        images: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Robotics & Automation',
        location: 'Rapid Prototyping Lab, Room 102',
        owner: ownerSharma._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 6,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 65,
          requiresTraining: true,
          trainingCourseName: 'LPKF CircuitPro PCB Design-to-Mill Workflow',
        },
        safetyInstructions: 'Always verify vacuum suction is engaged to extract FR4 fiberglass dust.',
        usageGuidelines: 'Bring copper-clad FR4 / Rogers laminates meeting thickness specs (0.8mm - 1.6mm).',
        securityDeposit: 1500,
        isPaid: false,
        condition: 'Good',
        tags: ['pcb', 'electronics', 'milling', 'hardware', 'prototyping'],
        totalBookingsCount: 16,
        rating: 4.82,
      },
      {
        name: 'Cleanroom Photolithography & Spin-Coating Bench',
        category: 'Laboratories',
        resourceType: 'space',
        description:
          'ISO Class 6 cleanroom workstation equipped with Laurell programmable spin coater, UV mask aligner (365nm i-line), hotplates, and chemical fume hood for microfluidics fabrication.',
        images: [
          'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Optics & Precision Engineering Core',
        location: 'Nanotechnology Building, Cleanroom Wing, Bay 3',
        owner: ownerJohn._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 3,
        maxBookingDurationHours: 8,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 80,
          requiresTraining: true,
          trainingCourseName: 'Cleanroom Gowning, Solvent Safety & Photoresist Processing',
          requiresSupervision: true,
          supervisorName: 'Cleanroom Facility Manager',
        },
        safetyInstructions: 'Full bunny suit gowning, nitrile gloves, and chemical splash goggles required in solvent area.',
        usageGuidelines: 'Dispose spent developer and SU-8 photoresist in designated hazardous waste carboys.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['cleanroom', 'nanotech', 'photolithography', 'microfluidics'],
        totalBookingsCount: 7,
        rating: 5.0,
      },
      {
        name: 'Smart Collaborative Amphitheater & Presentation Hall',
        category: 'Classrooms',
        resourceType: 'space',
        description:
          '120-seat interactive seminar theater featuring 4K dual laser projectors, wireless conferencing microphones, motorized drop-down screens, and automated lecture recording infrastructure.',
        images: [
          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Central Administration',
        location: 'Academic Complex, Ground Floor, Hall A',
        owner: ownerSharma._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 8,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 50,
          requiresTraining: false,
        },
        safetyInstructions: 'Maintain emergency exit clearances. No open flames or hazardous stage props.',
        usageGuidelines: 'Test AV inputs 15 minutes before session. Turn off projection bulbs via Crestron touch panel.',
        securityDeposit: 0,
        isPaid: false,
        condition: 'Excellent',
        tags: ['hall', 'presentation', 'auditorium', 'classroom', 'conference'],
        totalBookingsCount: 38,
        rating: 4.89,
      },
      {
        name: 'OpenBCI 16-Channel Mobile EEG & Brain-Computer Interface Kit',
        category: 'Scientific Instruments',
        resourceType: 'equipment',
        description:
          'Research-grade wireless bio-sensing headset with 16-channel Cyton + Daisy biosensing board, dry active electrodes, impedance testing module, and Python OpenBCI GUI integration.',
        images: [
          'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Biotechnology Core',
        location: 'Cognitive Science Lab, Cabinet B-2',
        owner: ownerJohn._id,
        quantity: 2,
        availableQuantity: 2,
        minBookingDurationHours: 1,
        maxBookingDurationHours: 6,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 60,
          requiresTraining: false,
        },
        safetyInstructions: 'Do not use abrasive cleaners on gold-plated electrode pins. Never use while participant is charging laptop.',
        usageGuidelines: 'Clean conductive paste thoroughly using isopropyl wipes after each subject testing.',
        securityDeposit: 1500,
        isPaid: false,
        condition: 'Excellent',
        tags: ['neuroscience', 'eeg', 'bci', 'biosensing', 'brain'],
        totalBookingsCount: 13,
        rating: 4.93,
      },
      {
        name: 'Universal Robots UR5e 6-Axis Collaborative Robotic Arm',
        category: 'Specialised Technical Resources',
        resourceType: 'equipment',
        description:
          'Industrial lightweight cobot with 5kg payload, 850mm reach, force/torque sensing at wrist, 2-finger adaptive electric gripper, and graphical PolyScope teach pendant.',
        images: [
          'https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Robotics & Automation',
        location: 'Advanced Robotics Cell, Bay 4',
        owner: ownerSharma._id,
        quantity: 1,
        availableQuantity: 1,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 8,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 75,
          requiresTraining: true,
          trainingCourseName: 'UR Core Cobot Programming & Emergency Stop Protocols',
        },
        safetyInstructions: 'Ensure safety envelope boundaries are calibrated on teach pendant before running autonomous routines.',
        usageGuidelines: 'Store gripper in open posture when turning control box power off.',
        securityDeposit: 3500,
        isPaid: false,
        condition: 'Excellent',
        tags: ['robotics', 'cobot', 'automation', 'ur5', 'industrial'],
        totalBookingsCount: 18,
        rating: 4.94,
      },
      {
        name: 'Dell Precision 7780 Mobile CAD & Simulation Workstation',
        category: 'Laptops',
        resourceType: 'equipment',
        description:
          '17.3-inch 4K mobile workstation with Intel Core i9-13950HX, 64GB ECC RAM, NVIDIA RTX 5000 Ada Generation 16GB GPU, preloaded with SolidWorks, ANSYS Fluent, and MATLAB.',
        images: [
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        ],
        institution: institution.name,
        department: 'Mechanical Engineering',
        location: 'Computer Systems Helpdesk, Desk 2',
        owner: ownerSharma._id,
        quantity: 2,
        availableQuantity: 2,
        minBookingDurationHours: 2,
        maxBookingDurationHours: 24,
        eligibilityRequirements: {
          requiresVerifiedUser: true,
          minFairUsageScore: 50,
          requiresTraining: false,
        },
        safetyInstructions: 'Do not expose laptop to liquids or mechanical impact. Carry only in provided reinforced backpack.',
        usageGuidelines: 'Store engineering simulation models on institutional cloud or external drive before check-out.',
        securityDeposit: 2000,
        isPaid: false,
        condition: 'Excellent',
        tags: ['laptop', 'workstation', 'cad', 'simulation', 'solidworks'],
        totalBookingsCount: 22,
        rating: 4.87,
      },
    ];

    const resources = await Resource.create(resourcesData);
    console.log(`[Seed] Seeded ${resources.length} high-fidelity equipment & lab resources.`);

    const dslrResource = resources.find((r) => r.name.includes('Sony Alpha'));
    const microscopeResource = resources.find((r) => r.name.includes('Microscope'));
    const printerResource = resources.find((r) => r.name.includes('3D Printer'));
    const laserResource = resources.find((r) => r.name.includes('Laser Lab'));

    // 4. Seed Bookings across all lifecycle states
    const now = new Date();
    const bookings = await Booking.create([
      // 1. Completed Booking
      {
        bookingNumber: 'AL-BK-90101',
        resource: dslrResource._id,
        borrower: borrowerArun._id,
        owner: ownerMaya._id,
        institution: institution.name,
        startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 40 * 60 * 60 * 1000),
        durationHours: 8,
        purpose: 'Annual Inter-College Robotics Symposium event documentation & video reel.',
        status: 'Completed',
        fairAllocationScoreAtBooking: 95,
        checkIn: {
          checkedInAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          borrowerNotes: 'Camera kit received in pristine condition. Lens clean, 3 batteries fully charged.',
          initialPhotos: [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
          ],
          verifiedByOwner: true,
          handoverTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          ownerNotes: 'Handed over to Arun Kumar with all cables and lens hood.',
        },
        checkOut: {
          returnRequestedAt: new Date(now.getTime() - 40 * 60 * 60 * 1000),
          borrowerNotes: 'All equipment intact, sensor checked, batteries recharged.',
          returnPhotos: [
            'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=400&q=80',
          ],
          inspectedByOwner: true,
          inspectedAt: new Date(now.getTime() - 39 * 60 * 60 * 1000),
          ownerInspectionNotes: 'Camera returned spotless. Verified sensor and accessories. Deposit released.',
          damageDetected: false,
          conditionStatus: 'Intact & Clean',
        },
      },
      // 2. Active Booking
      {
        bookingNumber: 'AL-BK-90202',
        resource: microscopeResource._id,
        borrower: borrowerPriya._id,
        owner: ownerJohn._id,
        institution: institution.name,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        durationHours: 6,
        purpose: 'Nanoparticle cellular uptake fluorescence observation for cancer therapeutics paper.',
        status: 'Active',
        fairAllocationScoreAtBooking: 98,
        checkIn: {
          checkedInAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          borrowerNotes: 'Calibration verified against standard micrometer slide. Optical bench zeroed.',
          initialPhotos: [
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=400&q=80',
          ],
          verifiedByOwner: true,
          handoverTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          ownerNotes: 'Laser alignment checked by technician before session.',
        },
        checkOut: {
          conditionStatus: 'Pending Inspection',
        },
      },
      // 3. Approved Booking (Awaiting check-in collection)
      {
        bookingNumber: 'AL-BK-90303',
        resource: printerResource._id,
        borrower: borrowerArun._id,
        owner: ownerSharma._id,
        institution: institution.name,
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        durationHours: 6,
        purpose: 'Printing autonomous rover chassis arm brackets using tough nylon filament.',
        status: 'Approved',
        fairAllocationScoreAtBooking: 92,
      },
      // 4. Pending Booking (Awaiting owner review)
      {
        bookingNumber: 'AL-BK-90404',
        resource: dslrResource._id,
        borrower: borrowerKavya._id,
        owner: ownerMaya._id,
        institution: institution.name,
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 30 * 60 * 60 * 1000),
        durationHours: 6,
        purpose: 'Student short documentary interview series on sustainable campus technology.',
        status: 'Pending',
        fairAllocationScoreAtBooking: 88,
      },
      // 5. Return Pending Booking (Borrower uploaded return photos, awaiting owner sign-off)
      {
        bookingNumber: 'AL-BK-90505',
        resource: printerResource._id,
        borrower: borrowerRahul._id,
        owner: ownerSharma._id,
        institution: institution.name,
        startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        durationHours: 4,
        purpose: 'Sensor bracket rapid prototyping.',
        status: 'Return Pending',
        fairAllocationScoreAtBooking: 82,
        checkIn: {
          checkedInAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
          borrowerNotes: 'Bed clean, filament loaded.',
          initialPhotos: [],
          verifiedByOwner: true,
          handoverTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        },
        checkOut: {
          returnRequestedAt: new Date(now.getTime() - 30 * 60 * 1000),
          borrowerNotes: 'Print finished cleanly. Glass plate cleaned with isopropyl alcohol. Ready for inspection.',
          returnPhotos: [
            'https://images.unsplash.com/photo-1631557559471-ae6076955146?auto=format&fit=crop&w=400&q=80',
          ],
          inspectedByOwner: false,
          conditionStatus: 'Pending Inspection',
        },
      },
    ]);
    console.log(`[Seed] Seeded ${bookings.length} realistic bookings covering the complete lifecycle.`);

    // 5. Seed Waiting List Entry
    await WaitingList.create({
      resource: printerResource._id,
      user: borrowerPriya._id,
      requestedStartTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      requestedEndTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      purpose: 'Printing microfluidics scaffold prototype.',
      queuePosition: 1,
      status: 'Waiting',
    });
    console.log('[Seed] Seeded Waiting List queue record.');

    // 6. Seed Sample Incident Report
    await Incident.create({
      incidentNumber: 'INC-2026-0019',
      category: 'equipment_malfunction',
      resource: printerResource._id,
      booking: bookings[0]._id,
      reportedBy: borrowerRahul._id,
      description:
        'Filament feeder gear experienced intermittent clicking and tension slip during extrusion at 210°C.',
      evidenceImages: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      ],
      severity: 'Low',
      status: 'Under Review',
      managerNotes: 'Technician scheduled to check drive-gear tensioner spring.',
      comments: [
        {
          author: ownerSharma._id,
          authorName: 'Dr. Ramesh Sharma',
          authorRole: 'owner',
          message: 'Thanks for flagging Rahul. We will inspect the feeder assembly before next print.',
          createdAt: new Date(now.getTime() - 10 * 60 * 1000),
        },
      ],
    });
    console.log('[Seed] Seeded Incident report with evidence & comments.');

    // 7. Seed Notifications
    await Notification.create([
      {
        user: ownerMaya._id,
        title: 'New Booking Request Received',
        message: 'Kavya Nair requested to borrow Sony Alpha A7 IV Kit for 6 hours.',
        type: 'booking_request',
        relatedBooking: bookings[3]._id,
        relatedResource: dslrResource._id,
        isRead: false,
      },
      {
        user: borrowerArun._id,
        title: 'Booking Approved!',
        message: 'Your booking for Ultimaker S5 3D Printer is approved! You can check in when collecting.',
        type: 'booking_approved',
        relatedBooking: bookings[2]._id,
        relatedResource: printerResource._id,
        isRead: true,
      },
      {
        user: ownerSharma._id,
        title: 'Return Inspection Requested',
        message: 'Rahul Verma has submitted return photographs for Ultimaker S5 3D Printer.',
        type: 'return_pending',
        relatedBooking: bookings[4]._id,
        relatedResource: printerResource._id,
        isRead: false,
      },
      {
        user: borrowerPriya._id,
        title: 'Active Session Underway',
        message: 'Your session with Olympus BX53 Fluorescence Microscope is currently active.',
        type: 'system',
        relatedBooking: bookings[1]._id,
        relatedResource: microscopeResource._id,
        isRead: true,
      },
    ]);
    console.log('[Seed] Seeded realistic Notifications.');

    // 8. Seed Audit Logs
    await AuditLog.create([
      {
        actionType: 'resource_created',
        performedBy: ownerMaya._id,
        userName: ownerMaya.name,
        userRole: ownerMaya.role,
        userEmail: ownerMaya.email,
        relatedResource: dslrResource._id,
        resourceName: dslrResource.name,
        explanation: 'Listed Sony Alpha A7 IV Cinema Kit under Digital Arts & Media Lab.',
      },
      {
        actionType: 'booking_submitted',
        performedBy: borrowerArun._id,
        userName: borrowerArun.name,
        userRole: borrowerArun.role,
        userEmail: borrowerArun.email,
        relatedResource: dslrResource._id,
        resourceName: dslrResource.name,
        bookingNumber: bookings[0].bookingNumber,
        explanation: 'Submitted reservation request for Robotics Symposium.',
      },
      {
        actionType: 'booking_approved',
        performedBy: ownerMaya._id,
        userName: ownerMaya.name,
        userRole: ownerMaya.role,
        userEmail: ownerMaya.email,
        relatedResource: dslrResource._id,
        resourceName: dslrResource.name,
        bookingNumber: bookings[0].bookingNumber,
        explanation: 'Booking approved after verifying borrower training credentials.',
        statusChange: { from: 'Pending', to: 'Approved' },
      },
      {
        actionType: 'check_in_completed',
        performedBy: ownerMaya._id,
        userName: ownerMaya.name,
        userRole: ownerMaya.role,
        userEmail: ownerMaya.email,
        relatedResource: dslrResource._id,
        resourceName: dslrResource.name,
        bookingNumber: bookings[0].bookingNumber,
        explanation: 'Handover verified and condition photos approved.',
        statusChange: { from: 'Approved', to: 'Active' },
      },
      {
        actionType: 'return_confirmed',
        performedBy: ownerMaya._id,
        userName: ownerMaya.name,
        userRole: ownerMaya.role,
        userEmail: ownerMaya.email,
        relatedResource: dslrResource._id,
        resourceName: dslrResource.name,
        bookingNumber: bookings[0].bookingNumber,
        explanation: 'Equipment returned in pristine condition. Transaction completed.',
        statusChange: { from: 'Return Pending', to: 'Completed' },
      },
    ]);
    console.log('[Seed] Seeded Audit Log accountability trail.');

    // 9. Seed Verification records
    await Verification.create({
      user: borrowerRahul._id,
      institution: institution.name,
      verificationType: 'Student ID',
      idNumber: 'STU-2024-3321',
      department: 'Electrical & Electronics',
      documentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      submittedNotes: 'Enrolled in 2nd year B.Tech EEE. Requesting lab and equipment borrowing clearance.',
      status: 'Pending Review',
    });
    console.log('[Seed] Seeded Verification request.');

    console.log('====================================================');
    console.log('🎉 ACCESSLOOP DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('DEMO CREDENTIALS:');
    console.log('  👑 Administrator:       admin@accessloop.edu       / Password123!');
    console.log('  🏛️ Institution Manager: manager@accessloop.edu     / Password123!');
    console.log('  🔬 Resource Owner:      dr.sharma@accessloop.edu   / Password123!');
    console.log('  🎬 Resource Owner:      media.prof@accessloop.edu  / Password123!');
    console.log('  🔬 Resource Owner:      lab.tech@accessloop.edu    / Password123!');
    console.log('  🎓 Borrower / Student:  arun.student@accessloop.edu / Password123!');
    console.log('  🧬 Borrower / Student:  priya.researcher@accessloop.edu / Password123!');
    console.log('  🎨 Borrower / Student:  kavya.creator@accessloop.edu / Password123!');
    console.log('====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
