const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin settings
  await prisma.adminSettings.upsert({
    where: { id: "admin-settings" },
    update: {},
    create: {
      id: "admin-settings",
      companyName: "THE SMART ERP",
      email: "admin@thesmart.com",
      phone: "+923001234567",
      address: "Lahore, Pakistan",
      adminName: "Super Admin",
      adminEmail: "admin@thesmart.com",
      adminMobile: "+923001234567",
      logo: "",
      headerLogo: "",
      footerLogo: "",
      favicon: "",
      smsApiKey: "",
      whatsappApiKey: "",
      paymentGatewayKey: "",
      header: "{}",
      footer: "{}",
      homepage: "{}",
    },
  });

  // Create a franchise for testing
  await prisma.franchise.upsert({
    where: { id: "FRN-001" },
    update: {},
    create: {
      id: "FRN-001",
      name: "Smart Telecom Franchise",
      owner: "Test Owner",
      cnic: "35202-1234567-1",
      mobile: "03001234567",
      email: "franchise@test.com",
      province: "Punjab",
      city: "Lahore",
      package: "Premium",
      status: "Active",
      agreementStart: "2024-01-01",
      agreementEnd: "2025-12-31",
      dsm: 2,
      dso: 5,
      password: "admin123",
      companyId: "COMP-001",
      network: "All",
    },
  });

  // Create a company for the company login
  await prisma.company.upsert({
    where: { id: "COMP-001" },
    update: {},
    create: {
      id: "COMP-001",
      name: "THE SMART ERP",
      owner: "Super Admin",
      email: "admin@thesmart.com",
      mobile: "03001234567",
      address: "Lahore, Pakistan",
      city: "Lahore",
      province: "Punjab",
      status: "Active",
      password: "admin123",
      franchiseCount: 1,
      createdAt: new Date().toISOString(),
    },
  });

  // Create a test DSO
  await prisma.dSO.upsert({
    where: { id: "DSO-001" },
    update: {},
    create: {
      id: "DSO-001",
      name: "Test DSO",
      fatherName: "Father Name",
      cnic: "35202-7654321-1",
      mobile: "03007654321",
      address: "Lahore",
      assignedDSM: "DSM-001",
      joiningDate: "2024-01-01",
      salary: 30000,
      commission: 500,
      username: "dso001",
      password: "admin123",
      status: "Active",
      photo: "",
      franchiseId: "FRN-001",
      retailerId: "DSO-001",
    },
  });

  // Create a test DSM
  await prisma.dSM.upsert({
    where: { id: "DSM-001" },
    update: {},
    create: {
      id: "DSM-001",
      name: "Test DSM",
      fatherName: "Father Name",
      cnic: "35202-1111111-1",
      mobile: "03001111111",
      email: "dsm@test.com",
      address: "Lahore",
      joiningDate: "2024-01-01",
      salary: 50000,
      commission: 1000,
      username: "dsm001",
      password: "admin123",
      status: "Active",
      photo: "",
      franchiseId: "FRN-001",
      retailerId: "DSM-001",
    },
  });

  console.log("Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("Franchise: ID=FRN-001, Password=admin123");
  console.log("Company:   ID=COMP-001, Password=admin123");
  console.log("DSO:       username=dso001, Password=admin123");
  console.log("DSM:       username=dsm001, Password=admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
