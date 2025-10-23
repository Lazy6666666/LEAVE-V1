// Database seed file - Comprehensive mock data for calendar demonstration

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data
  await prisma.leave.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.companyDocument.deleteMany();

  // Create Leave Types
  console.log("📝 Creating leave types...");
  const leaveTypes = await Promise.all([
    prisma.leaveType.create({
      data: {
        name: "Annual",
        annual_quota: 21,
        requires_approval: true,
        active: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: "Sick",
        annual_quota: 10,
        requires_approval: false,
        active: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: "Personal",
        annual_quota: 5,
        requires_approval: true,
        active: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: "Maternity",
        annual_quota: 90,
        requires_approval: true,
        active: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: "Paternity",
        annual_quota: 14,
        requires_approval: true,
        active: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: "Study",
        annual_quota: 3,
        requires_approval: true,
        active: true,
      },
    }),
    prisma.leaveType.create({
      data: {
        name: "Bereavement",
        annual_quota: 3,
        requires_approval: false,
        active: true,
      },
    }),
  ]);

  // Create Users and Profiles
  console.log("👥 Creating users and profiles...");
  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Design",
  ];
  const roles = ["EMPLOYEE", "MANAGER", "HR", "ADMIN"];

  const users = [];

  // Create mock users
  for (let i = 0; i < 25; i++) {
    const email = `user${i + 1}@example.com`;

    const user = await prisma.user.create({
      data: {
        email,
      },
    });

    const department =
      departments[Math.floor(Math.random() * departments.length)];
    const profile = await prisma.profile.create({
      data: {
        user_id: user.id,
        full_name: `${["John", "Jane", "Michael", "Sarah", "David", "Emma", "Chris", "Lisa", "Tom", "Anna"][Math.floor(Math.random() * 10)]} ${["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Anderson"][Math.floor(Math.random() * 10)]}`,
        department,
        role: roles[Math.floor(Math.random() * roles.length)] as any,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      },
    });

    users.push({ user, profile });
  }

  // Create Sample Leave Requests for Calendar Demonstration
  console.log("📅 Creating sample leave requests...");
  const currentDate = new Date();
  const sixMonthsAgo = new Date(
    currentDate.getTime() - 180 * 24 * 60 * 60 * 1000
  );
  const sixMonthsFromNow = new Date(
    currentDate.getTime() + 180 * 24 * 60 * 60 * 1000
  );

  for (let i = 0; i < 40; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomLeaveType =
      leaveTypes[Math.floor(Math.random() * leaveTypes.length)];

    // Generate random dates within the 6-month range
    const startDate = new Date(
      sixMonthsAgo.getTime() +
        Math.random() * (sixMonthsFromNow.getTime() - sixMonthsAgo.getTime())
    );

    const duration = Math.floor(Math.random() * 10) + 1; // 1-10 days
    const endDate = new Date(
      startDate.getTime() + (duration - 1) * 24 * 60 * 60 * 1000
    );

    // Only create leaves that don't overlap too much for demo purposes
    const existingLeaves = await prisma.leave.findMany({
      where: {
        user_id: randomUser.user.id,
        AND: [
          { start_date: { lte: endDate } },
          { end_date: { gte: startDate } },
        ],
      },
    });

    if (existingLeaves.length === 0) {
      await prisma.leave.create({
        data: {
          user_id: randomUser.user.id,
          leave_type_id: randomLeaveType.id,
          start_date: startDate,
          end_date: endDate,
          days_count: duration,
          reason: [
            "Family vacation",
            "Medical appointment",
            "Personal time",
            "Conference attendance",
            "Family emergency",
            "Professional development",
            "Relaxation and recharge",
            "Travel plans",
            "Home maintenance",
            "Child care",
          ][Math.floor(Math.random() * 10)],
          status:
            Math.random() > 0.1
              ? "APPROVED"
              : Math.random() > 0.5
                ? "PENDING"
                : "REJECTED",
          // approver_id field doesn't exist in Leave model, removing this line
          approved_at:
            Math.random() > 0.3
              ? new Date(
                  startDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
                )
              : null,
          created_at: new Date(
            startDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          updated_at: new Date(),
        },
      });
    }
  }

  // Create some specific concurrent leaves for conflict demonstration
  console.log("⚠️  Creating concurrent leaves for conflict demo...");
  const conflictStartDate = new Date(
    currentDate.getTime() + 14 * 24 * 60 * 60 * 1000
  ); // 2 weeks from now
  const conflictEndDate = new Date(
    conflictStartDate.getTime() + 4 * 24 * 60 * 60 * 1000
  ); // 5 days

  // Create 3-4 concurrent leaves for the same department
  const engineeringUsers = users
    .filter((u) => u.profile.department === "Engineering")
    .slice(0, 4);
  for (const engUser of engineeringUsers) {
    await prisma.leave.create({
      data: {
        user_id: engUser.user.id,
        leave_type_id: leaveTypes[0].id, // Annual leave
        start_date: conflictStartDate,
        end_date: conflictEndDate,
        days_count: 5,
        reason: "Team building retreat",
        status: "APPROVED",
        approved_by: users.filter((u) => u.profile.role === "MANAGER")[0]?.user
          .id,
        approved_at: new Date(),
        created_at: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      },
    });
  }

  // Create Company Documents
  console.log("📄 Creating company documents...");
  const documents = [
    {
      title: "Employee Handbook 2024",
      description: "Complete employee handbook with policies and procedures",
      file_url: "/documents/employee-handbook-2024.pdf",
      file_type: "PDF",
      file_size: 2048576,
      category: "POLICY",
      required_reading: true,
    },
    {
      title: "Health and Safety Guidelines",
      description: "Workplace health and safety protocols",
      file_url: "/documents/health-safety-guidelines.pdf",
      file_type: "PDF",
      file_size: 1024000,
      category: "SAFETY",
      required_reading: true,
    },
    {
      title: "Benefits Overview",
      description: "Complete guide to employee benefits and compensation",
      file_url: "/documents/benefits-overview.pdf",
      file_type: "PDF",
      file_size: 3072000,
      category: "BENEFITS",
      required_reading: false,
    },
    {
      title: "Leave Policy Guidelines",
      description: "Detailed leave policies and procedures",
      file_url: "/documents/leave-policy.pdf",
      file_type: "PDF",
      file_size: 512000,
      category: "POLICY",
      required_reading: true,
    },
  ];

  for (const doc of documents) {
    await prisma.companyDocument.create({
      data: {
        ...doc,
        file_name: doc.title.toLowerCase().replace(/\s+/g, "-") + ".pdf",
        uploaded_by: users[0].user.id,
        created_at: new Date(
          currentDate.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000
        ),
        updated_at: new Date(),
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
  console.log(
    `📊 Created ${users.length} users, ${leaveTypes.length} leave types, and 40+ leave requests`
  );
  console.log("🎭 Demo credentials:");
  console.log("   Email: user1@example.com");
  console.log("   Password: password123");
  console.log("");
  console.log("🏢 Departments created:", departments.join(", "));
  console.log(
    "📅 Calendar has leaves from:",
    sixMonthsAgo.toLocaleDateString(),
    "to",
    sixMonthsFromNow.toLocaleDateString()
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
