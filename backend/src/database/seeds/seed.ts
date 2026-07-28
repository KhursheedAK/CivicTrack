import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';
import { Category } from '../../categories/entities/category.entity';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { ComplaintAttachment } from '../../complaints/entities/complaint-attachment.entity';
import { ComplaintUpdate } from '../../complaints/entities/complaint-update.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Role } from '../../common/enums/role.enum';
import { ComplaintStatus } from '../../common/enums/complaint-status.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';

const SALT_ROUNDS = 10;

const CITIES = ['Rawalpindi', 'Islamabad', 'Gilgit'];

function pad(num: number, size: number): string {
  return num.toString().padStart(size, '0');
}

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Database connection established.');

  const userRepo = AppDataSource.getRepository(User);
  const departmentRepo = AppDataSource.getRepository(Department);
  const categoryRepo = AppDataSource.getRepository(Category);
  const complaintRepo = AppDataSource.getRepository(Complaint);
  const attachmentRepo = AppDataSource.getRepository(ComplaintAttachment);
  const updateRepo = AppDataSource.getRepository(ComplaintUpdate);
  const notificationRepo = AppDataSource.getRepository(Notification);

  console.log('Clearing existing data...');
  await notificationRepo.createQueryBuilder().delete().execute();
  await attachmentRepo.createQueryBuilder().delete().execute();
  await updateRepo.createQueryBuilder().delete().execute();
  await complaintRepo.createQueryBuilder().delete().execute();
  await categoryRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();
  await departmentRepo.createQueryBuilder().delete().execute();

  console.log('Seeding departments...');
  const waterDept = await departmentRepo.save(
    departmentRepo.create({
      name: 'Water & Sanitation',
      description: 'Water supply, drainage, and sanitation services',
      is_active: true,
    }),
  );
  const roadsDept = await departmentRepo.save(
    departmentRepo.create({
      name: 'Roads & Infrastructure',
      description: 'Road maintenance, street lighting, and public infrastructure',
      is_active: true,
    }),
  );
  const electricityDept = await departmentRepo.save(
    departmentRepo.create({
      name: 'Electricity & Power',
      description: 'Power supply, outages, and billing services',
      is_active: true,
    }),
  );

  console.log('Seeding categories...');
  const leakingPipe = await categoryRepo.save(
    categoryRepo.create({
      name: 'Leaking Pipe',
      department_id: waterDept.id,
      is_active: true,
    }),
  );
  const noWaterSupply = await categoryRepo.save(
    categoryRepo.create({
      name: 'No Water Supply',
      department_id: waterDept.id,
      is_active: true,
    }),
  );
  const pothole = await categoryRepo.save(
    categoryRepo.create({
      name: 'Pothole / Road Damage',
      department_id: roadsDept.id,
      is_active: true,
    }),
  );
  const streetLight = await categoryRepo.save(
    categoryRepo.create({
      name: 'Street Light Not Working',
      department_id: roadsDept.id,
      is_active: true,
    }),
  );
  const powerOutage = await categoryRepo.save(
    categoryRepo.create({
      name: 'Power Outage',
      department_id: electricityDept.id,
      is_active: true,
    }),
  );
  const billingDispute = await categoryRepo.save(
    categoryRepo.create({
      name: 'Billing Dispute',
      department_id: electricityDept.id,
      is_active: true,
    }),
  );

  console.log('Seeding users...');
  const adminPasswordHash = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
  const officerPasswordHash = await bcrypt.hash('Officer@1234', SALT_ROUNDS);
  const citizenPasswordHash = await bcrypt.hash('Citizen@1234', SALT_ROUNDS);

  const admin = await userRepo.save(
    userRepo.create({
      name: 'System Administrator',
      email: 'admin@civictrack.app',
      password_hash: adminPasswordHash,
      role: Role.ADMIN,
      is_verified: true,
    }),
  );

  const officer = await userRepo.save(
    userRepo.create({
      name: 'Ahmed Raza',
      email: 'officer@civictrack.app',
      password_hash: officerPasswordHash,
      role: Role.OFFICER,
      is_verified: true,
      department_id: waterDept.id,
    }),
  );

  const citizen = await userRepo.save(
    userRepo.create({
      name: 'Bilal Khan',
      email: 'citizen@civictrack.app',
      password_hash: citizenPasswordHash,
      role: Role.CITIZEN,
      is_verified: true,
    }),
  );

  // Additional officers for variety
  const roadsOfficer = await userRepo.save(
    userRepo.create({
      name: 'Sana Tariq',
      email: 'roads.officer@civictrack.app',
      password_hash: officerPasswordHash,
      role: Role.OFFICER,
      is_verified: true,
      department_id: roadsDept.id,
    }),
  );

  const electricityOfficer = await userRepo.save(
    userRepo.create({
      name: 'Usman Ali',
      email: 'electricity.officer@civictrack.app',
      password_hash: officerPasswordHash,
      role: Role.OFFICER,
      is_verified: true,
      department_id: electricityDept.id,
    }),
  );

  // Additional citizens for variety
  const citizens = [citizen];
  const extraCitizenNames = ['Ayesha Malik', 'Hamza Sheikh', 'Fatima Noor'];
  for (let i = 0; i < extraCitizenNames.length; i++) {
    const c = await userRepo.save(
      userRepo.create({
        name: extraCitizenNames[i],
        email: `citizen${i + 2}@civictrack.app`,
        password_hash: citizenPasswordHash,
        role: Role.CITIZEN,
        is_verified: true,
      }),
    );
    citizens.push(c);
  }

  console.log('Seeding complaints...');

  type ComplaintSeed = {
    title: string;
    description: string;
    location: string;
    department: Department;
    category: Category;
    status: ComplaintStatus;
    assignedOfficer?: User;
    hasAttachment?: boolean;
  };

  const complaintSeeds: ComplaintSeed[] = [
    {
      title: 'Major water pipe leaking near main road',
      description:
        'A large water pipe has been leaking continuously for three days, flooding the street and wasting a significant amount of water.',
      location: `Satellite Town, ${CITIES[0]}`,
      department: waterDept,
      category: leakingPipe,
      status: ComplaintStatus.SUBMITTED,
    },
    {
      title: 'No water supply for the past week',
      description:
        'Our entire block has had no water supply for over a week. Residents are struggling to manage daily needs.',
      location: `G-9 Sector, ${CITIES[1]}`,
      department: waterDept,
      category: noWaterSupply,
      status: ComplaintStatus.UNDER_REVIEW,
      assignedOfficer: officer,
    },
    {
      title: 'Leaking pipe near community park',
      description:
        'There is a small but persistent leak from an underground pipe near the community park entrance.',
      location: `F-10 Markaz, ${CITIES[1]}`,
      department: waterDept,
      category: leakingPipe,
      status: ComplaintStatus.IN_PROGRESS,
      assignedOfficer: officer,
      hasAttachment: true,
    },
    {
      title: 'No water pressure in the morning',
      description:
        'Water pressure drops to almost nothing every morning between 6 AM and 9 AM, making it difficult to fill tanks.',
      location: `Chaklala Scheme III, ${CITIES[0]}`,
      department: waterDept,
      category: noWaterSupply,
      status: ComplaintStatus.RESOLVED,
      assignedOfficer: officer,
    },
    {
      title: 'Sewage water mixing with clean water supply',
      description:
        'We have noticed sewage water mixing with our clean water supply line, causing a foul smell and discoloration.',
      location: `Murree Road, ${CITIES[0]}`,
      department: waterDept,
      category: leakingPipe,
      status: ComplaintStatus.RESOLVED,
      assignedOfficer: officer,
    },
    {
      title: 'Old leaking pipe finally fixed - closing complaint',
      description:
        'The leaking pipe reported earlier has been fixed. Confirming closure of this complaint.',
      location: `Bahria Town Phase 4, ${CITIES[0]}`,
      department: waterDept,
      category: leakingPipe,
      status: ComplaintStatus.CLOSED,
      assignedOfficer: officer,
    },
    {
      title: 'Request for tanker - duplicate complaint',
      description:
        'Requesting a water tanker for our street, but this turned out to be a duplicate of an existing request.',
      location: `I-8 Markaz, ${CITIES[1]}`,
      department: waterDept,
      category: noWaterSupply,
      status: ComplaintStatus.REJECTED,
      assignedOfficer: officer,
    },
    {
      title: 'Large pothole causing traffic accidents',
      description:
        'A deep pothole has formed at the main intersection, causing several minor traffic accidents this week.',
      location: `Airport Road, ${CITIES[0]}`,
      department: roadsDept,
      category: pothole,
      status: ComplaintStatus.SUBMITTED,
      hasAttachment: true,
    },
    {
      title: 'Multiple potholes on main avenue',
      description:
        'The main avenue connecting the two sectors has developed multiple large potholes after the recent rains.',
      location: `Jinnah Avenue, ${CITIES[1]}`,
      department: roadsDept,
      category: pothole,
      status: ComplaintStatus.UNDER_REVIEW,
      assignedOfficer: roadsOfficer,
    },
    {
      title: 'Road damage near school entrance',
      description:
        'The road surface near the school entrance is severely damaged, posing a risk to children walking to school.',
      location: `Lalazar, ${CITIES[0]}`,
      department: roadsDept,
      category: pothole,
      status: ComplaintStatus.IN_PROGRESS,
      assignedOfficer: roadsOfficer,
      hasAttachment: true,
    },
    {
      title: 'Street lights not working on main boulevard',
      description:
        'All street lights along the main boulevard have been non-functional for two weeks, creating safety concerns at night.',
      location: `Blue Area, ${CITIES[1]}`,
      department: roadsDept,
      category: streetLight,
      status: ComplaintStatus.RESOLVED,
      assignedOfficer: roadsOfficer,
    },
    {
      title: 'Single street light flickering',
      description:
        'One street light near the park keeps flickering on and off every night.',
      location: `Jamia Masjid Road, ${CITIES[2]}`,
      department: roadsDept,
      category: streetLight,
      status: ComplaintStatus.RESOLVED,
      assignedOfficer: roadsOfficer,
    },
    {
      title: 'Street light repaired and confirmed working',
      description:
        'The previously reported broken street light has been repaired and is now working correctly.',
      location: `Saddar, ${CITIES[0]}`,
      department: roadsDept,
      category: streetLight,
      status: ComplaintStatus.CLOSED,
      assignedOfficer: roadsOfficer,
    },
    {
      title: 'Pothole report outside jurisdiction',
      description:
        'Reported a pothole that was later found to be on private property and outside municipal jurisdiction.',
      location: `Private Housing Society, ${CITIES[0]}`,
      department: roadsDept,
      category: pothole,
      status: ComplaintStatus.REJECTED,
      assignedOfficer: roadsOfficer,
    },
    {
      title: 'Extended power outage in residential area',
      description:
        'Our area has experienced a power outage lasting more than 12 hours with no communication from the utility company.',
      location: `Wapda Town, ${CITIES[0]}`,
      department: electricityDept,
      category: powerOutage,
      status: ComplaintStatus.SUBMITTED,
      hasAttachment: true,
    },
    {
      title: 'Frequent power tripping during evening hours',
      description:
        'Power keeps tripping every evening between 7 PM and 10 PM, affecting household appliances.',
      location: `H-13, ${CITIES[1]}`,
      department: electricityDept,
      category: powerOutage,
      status: ComplaintStatus.UNDER_REVIEW,
      assignedOfficer: electricityOfficer,
    },
    {
      title: 'Incorrect electricity bill amount',
      description:
        'This month\'s electricity bill is nearly triple the usual amount despite no change in consumption patterns.',
      location: `Chah Sultan, ${CITIES[2]}`,
      department: electricityDept,
      category: billingDispute,
      status: ComplaintStatus.IN_PROGRESS,
      assignedOfficer: electricityOfficer,
      hasAttachment: true,
    },
    {
      title: 'Billing dispute resolved with corrected invoice',
      description:
        'After review, the billing error was identified and a corrected invoice has been issued.',
      location: `Race Course Road, ${CITIES[0]}`,
      department: electricityDept,
      category: billingDispute,
      status: ComplaintStatus.RESOLVED,
      assignedOfficer: electricityOfficer,
    },
    {
      title: 'Power restored after transformer repair',
      description:
        'The transformer serving our block was repaired and power supply has been fully restored.',
      location: `Sector G-11, ${CITIES[1]}`,
      department: electricityDept,
      category: powerOutage,
      status: ComplaintStatus.CLOSED,
      assignedOfficer: electricityOfficer,
    },
    {
      title: 'Duplicate billing complaint',
      description:
        'Submitted a billing dispute that was later identified as a duplicate of a previously resolved complaint.',
      location: `Kashmir Point, ${CITIES[2]}`,
      department: electricityDept,
      category: billingDispute,
      status: ComplaintStatus.REJECTED,
      assignedOfficer: electricityOfficer,
    },
    {
      title: 'New pothole appeared after road work',
      description:
        'A new pothole has appeared right where road maintenance work was recently completed.',
      location: `Committee Chowk, ${CITIES[0]}`,
      department: roadsDept,
      category: pothole,
      status: ComplaintStatus.SUBMITTED,
    },
    {
      title: 'Water tank overflow due to faulty pipe',
      description:
        'A faulty pipe connection is causing the community water tank to overflow continuously, wasting water.',
      location: `Sector F-7, ${CITIES[1]}`,
      department: waterDept,
      category: leakingPipe,
      status: ComplaintStatus.UNDER_REVIEW,
      assignedOfficer: officer,
    },
  ];

  let sequence = 1;
  const year = new Date().getFullYear();

  for (let i = 0; i < complaintSeeds.length; i++) {
    const seedData = complaintSeeds[i];
    const trackingCode = `CMP-${year}-${pad(sequence, 5)}`;
    sequence++;

    const complaintCitizen = citizens[i % citizens.length];

    const complaint = complaintRepo.create({
      tracking_code: trackingCode,
      title: seedData.title,
      description: seedData.description,
      location: seedData.location,
      status: seedData.status,
      citizen_id: complaintCitizen.id,
      department_id: seedData.department.id,
      category_id: seedData.category.id,
      assigned_officer_id: seedData.assignedOfficer?.id ?? null,
      resolved_at:
        seedData.status === ComplaintStatus.RESOLVED ||
        seedData.status === ComplaintStatus.CLOSED
          ? new Date()
          : null,
    });

    const savedComplaint = await complaintRepo.save(complaint);

    if (seedData.hasAttachment) {
      const attachment = new ComplaintAttachment();
      attachment.complaint_id = savedComplaint.id;
      attachment.file_url = `https://res.cloudinary.com/civictrack/image/upload/v1700000000/seed/${savedComplaint.id}.jpg`;
      attachment.file_name = 'complaint-photo.jpg';
      attachment.mime_type = 'image/jpeg';
      attachment.cloudinary_public_id = `seed/${savedComplaint.id}`;
      await attachmentRepo.save(attachment);
    }

    if (seedData.status !== ComplaintStatus.SUBMITTED) {
      const author = seedData.assignedOfficer ?? admin;
      const update = updateRepo.create({
        complaint_id: savedComplaint.id,
        author_id: author.id,
        comment: `Status updated to ${seedData.status}.`,
        status_changed_to: seedData.status,
      });
      await updateRepo.save(update);

      await notificationRepo.save(
        notificationRepo.create({
          user_id: complaintCitizen.id,
          message: `Your complaint "${savedComplaint.title}" status changed to ${seedData.status}.`,
          type: NotificationType.STATUS_CHANGED,
          reference_id: savedComplaint.id,
          is_read: false,
        }),
      );
    }
  }

  console.log('Seed data created successfully.');
  console.log('Demo accounts:');
  console.log('  Admin:   admin@civictrack.app / Admin@1234');
  console.log('  Officer: officer@civictrack.app / Officer@1234');
  console.log('  Citizen: citizen@civictrack.app / Citizen@1234');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
