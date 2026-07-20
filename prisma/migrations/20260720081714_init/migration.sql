-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "franchiseCount" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "agreementStart" TEXT,
    "agreementEnd" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Franchise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "cnic" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "agreementStart" TEXT NOT NULL,
    "agreementEnd" TEXT NOT NULL,
    "dsm" INTEGER NOT NULL,
    "dso" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "network" TEXT NOT NULL,

    CONSTRAINT "Franchise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "franchise" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "joining" TEXT NOT NULL,
    "attendance" INTEGER NOT NULL,
    "performance" INTEGER NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "franchise" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "package" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "franchises" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "popular" BOOLEAN NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CMSPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updated" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "CMSPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" TEXT NOT NULL DEFAULT 'admin-settings',
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "smsApiKey" TEXT NOT NULL,
    "whatsappApiKey" TEXT NOT NULL,
    "paymentGatewayKey" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminMobile" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "headerLogo" TEXT NOT NULL,
    "footerLogo" TEXT NOT NULL,
    "favicon" TEXT NOT NULL,
    "header" TEXT NOT NULL,
    "footer" TEXT NOT NULL,
    "homepage" TEXT NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FranchiseData" (
    "id" TEXT NOT NULL DEFAULT 'franchise-settings',
    "data" TEXT NOT NULL,

    CONSTRAINT "FranchiseData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSM" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "cnic" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "joiningDate" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "employeeCode" TEXT,
    "dob" TEXT,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "bloodGroup" TEXT,
    "nationality" TEXT,
    "whatsapp" TEXT,
    "emergencyContact" TEXT,
    "emergencyContactPerson" TEXT,
    "emergencyRelationship" TEXT,
    "province" TEXT,
    "city" TEXT,
    "area" TEXT,
    "postalCode" TEXT,
    "employmentType" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "reportingManager" TEXT,
    "deviceBrand" TEXT,
    "deviceModel" TEXT,
    "registeredMobile" TEXT,
    "otpNumber" TEXT,
    "deviceStatus" TEXT,
    "newSimLimits" TEXT,
    "hlrSimLimits" TEXT,
    "dailyTargets" TEXT,
    "monthlyTargets" TEXT,
    "fuelAllowance" DOUBLE PRECISION,
    "mobileAllowance" DOUBLE PRECISION,
    "dailyAllowance" DOUBLE PRECISION,
    "residenceAllowance" DOUBLE PRECISION,
    "commissionType" TEXT,
    "newSimCommission" DOUBLE PRECISION,
    "mnpCommission" DOUBLE PRECISION,
    "replacementCommission" DOUBLE PRECISION,
    "bynCommission" DOUBLE PRECISION,
    "hikeCommission" DOUBLE PRECISION,
    "otherCommission" DOUBLE PRECISION,
    "newSimBvs" DOUBLE PRECISION,
    "newSimFca" DOUBLE PRECISION,
    "newSimIfca" DOUBLE PRECISION,
    "mnpBvs" DOUBLE PRECISION,
    "mnpFca" DOUBLE PRECISION,
    "mnpIfca" DOUBLE PRECISION,
    "replacementBvs" DOUBLE PRECISION,
    "replacementFca" DOUBLE PRECISION,
    "replacementIfca" DOUBLE PRECISION,
    "bynBvs" DOUBLE PRECISION,
    "bynFca" DOUBLE PRECISION,
    "bynIfca" DOUBLE PRECISION,
    "targetBonus" DOUBLE PRECISION,
    "advanceSalary" DOUBLE PRECISION,
    "loanDeduction" DOUBLE PRECISION,
    "otherDeduction" DOUBLE PRECISION,
    "bonus" DOUBLE PRECISION,
    "bankName" TEXT,
    "accountTitle" TEXT,
    "accountNumber" TEXT,
    "iban" TEXT,
    "easypaisaNumber" TEXT,
    "jazzcashNumber" TEXT,
    "documents" TEXT,
    "agreements" TEXT,
    "guarantor" TEXT,
    "attendanceSettings" TEXT,
    "permissions" TEXT,

    CONSTRAINT "DSM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSO" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "cnic" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "assignedDSM" TEXT NOT NULL,
    "joiningDate" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "employeeCode" TEXT,
    "dob" TEXT,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "bloodGroup" TEXT,
    "nationality" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "emergencyContact" TEXT,
    "emergencyContactPerson" TEXT,
    "emergencyRelationship" TEXT,
    "province" TEXT,
    "city" TEXT,
    "area" TEXT,
    "postalCode" TEXT,
    "employmentType" TEXT,
    "department" TEXT,
    "designation" TEXT,
    "assignedFranchise" TEXT,
    "reportingManager" TEXT,
    "deviceBrand" TEXT,
    "deviceModel" TEXT,
    "registeredMobile" TEXT,
    "otpNumber" TEXT,
    "deviceStatus" TEXT,
    "newSimLimits" TEXT,
    "hlrSimLimits" TEXT,
    "dailyTargets" TEXT,
    "monthlyTargets" TEXT,
    "fuelAllowance" DOUBLE PRECISION,
    "mobileAllowance" DOUBLE PRECISION,
    "dailyAllowance" DOUBLE PRECISION,
    "residenceAllowance" DOUBLE PRECISION,
    "commissionType" TEXT,
    "newSimCommission" DOUBLE PRECISION,
    "mnpCommission" DOUBLE PRECISION,
    "replacementCommission" DOUBLE PRECISION,
    "bynCommission" DOUBLE PRECISION,
    "hikeCommission" DOUBLE PRECISION,
    "otherCommission" DOUBLE PRECISION,
    "newSimBvs" DOUBLE PRECISION,
    "newSimFca" DOUBLE PRECISION,
    "newSimIfca" DOUBLE PRECISION,
    "mnpBvs" DOUBLE PRECISION,
    "mnpFca" DOUBLE PRECISION,
    "mnpIfca" DOUBLE PRECISION,
    "replacementBvs" DOUBLE PRECISION,
    "replacementFca" DOUBLE PRECISION,
    "replacementIfca" DOUBLE PRECISION,
    "bynBvs" DOUBLE PRECISION,
    "bynFca" DOUBLE PRECISION,
    "bynIfca" DOUBLE PRECISION,
    "targetBonus" DOUBLE PRECISION,
    "advanceSalary" DOUBLE PRECISION,
    "loanDeduction" DOUBLE PRECISION,
    "otherDeduction" DOUBLE PRECISION,
    "bonus" DOUBLE PRECISION,
    "bankName" TEXT,
    "accountTitle" TEXT,
    "accountNumber" TEXT,
    "iban" TEXT,
    "easypaisaNumber" TEXT,
    "jazzcashNumber" TEXT,
    "documents" TEXT,
    "agreements" TEXT,
    "guarantor" TEXT,
    "attendanceSettings" TEXT,
    "permissions" TEXT,

    CONSTRAINT "DSO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "bvsNumber" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedDSO" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "returnDate" TEXT NOT NULL,
    "originalRetailerId" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIM" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "simNumber" TEXT NOT NULL,
    "iccid" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "receiveDate" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuedToId" TEXT,
    "issuedToName" TEXT,
    "issuedToRole" TEXT,
    "statusDate" TEXT,
    "statusChangedFrom" TEXT,

    CONSTRAINT "SIM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SIMIssueRecord" (
    "id" TEXT NOT NULL,
    "simIds" TEXT NOT NULL,
    "issuedTo" TEXT NOT NULL,
    "issuedToRole" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "returnDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "SIMIssueRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "returnDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "category" TEXT,
    "quantity" INTEGER,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentItemName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "EquipmentItemName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentIssueRecord" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "personRole" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "returnDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "EquipmentIssueRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceIssueRecord" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedToName" TEXT NOT NULL,
    "assignedToRole" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "baseRetailerId" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "returnDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "DeviceIssueRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    "gps" TEXT NOT NULL,
    "selfie" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "dailyTarget" INTEGER NOT NULL,
    "monthlyTarget" INTEGER NOT NULL,
    "achieved" INTEGER NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "dsoId" TEXT,
    "month" TEXT,
    "deviceTarget" INTEGER,
    "deviceAchieved" INTEGER,
    "simTarget" INTEGER,
    "simAchieved" INTEGER,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION,
    "remarks" TEXT,
    "note" TEXT,
    "date" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "salary" DOUBLE PRECISION,
    "bonus" DOUBLE PRECISION,
    "commission" DOUBLE PRECISION,
    "deduction" DOUBLE PRECISION,
    "net" DOUBLE PRECISION,
    "basicSalary" DOUBLE PRECISION,
    "allowances" DOUBLE PRECISION,
    "deductions" DOUBLE PRECISION,
    "netPay" DOUBLE PRECISION,
    "fuelAllowance" DOUBLE PRECISION,
    "mobileAllowance" DOUBLE PRECISION,
    "dailyAllowance" DOUBLE PRECISION,
    "residenceAllowance" DOUBLE PRECISION,
    "newSimCount" INTEGER,
    "newSimRate" DOUBLE PRECISION,
    "newSimCommission" DOUBLE PRECISION,
    "newSimBvsRate" DOUBLE PRECISION,
    "newSimBvsCommission" DOUBLE PRECISION,
    "newSimFcaRate" DOUBLE PRECISION,
    "newSimFcaCommission" DOUBLE PRECISION,
    "newSimIfcaRate" DOUBLE PRECISION,
    "newSimIfcaCommission" DOUBLE PRECISION,
    "mnpCount" INTEGER,
    "mnpRate" DOUBLE PRECISION,
    "mnpCommission" DOUBLE PRECISION,
    "mnpBvsRate" DOUBLE PRECISION,
    "mnpBvsCommission" DOUBLE PRECISION,
    "mnpFcaRate" DOUBLE PRECISION,
    "mnpFcaCommission" DOUBLE PRECISION,
    "mnpIfcaRate" DOUBLE PRECISION,
    "mnpIfcaCommission" DOUBLE PRECISION,
    "replacementCount" INTEGER,
    "replacementRate" DOUBLE PRECISION,
    "replacementCommission" DOUBLE PRECISION,
    "replacementBvsRate" DOUBLE PRECISION,
    "replacementBvsCommission" DOUBLE PRECISION,
    "replacementFcaRate" DOUBLE PRECISION,
    "replacementFcaCommission" DOUBLE PRECISION,
    "replacementIfcaRate" DOUBLE PRECISION,
    "replacementIfcaCommission" DOUBLE PRECISION,
    "bynCount" INTEGER,
    "bynRate" DOUBLE PRECISION,
    "bynCommission" DOUBLE PRECISION,
    "bynBvsRate" DOUBLE PRECISION,
    "bynBvsCommission" DOUBLE PRECISION,
    "bynFcaRate" DOUBLE PRECISION,
    "bynFcaCommission" DOUBLE PRECISION,
    "bynIfcaRate" DOUBLE PRECISION,
    "bynIfcaCommission" DOUBLE PRECISION,
    "hikeCommission" DOUBLE PRECISION,
    "otherCommission" DOUBLE PRECISION,
    "targetBonus" DOUBLE PRECISION,
    "performanceBonus" DOUBLE PRECISION,
    "advanceSalary" DOUBLE PRECISION,
    "loanDeduction" DOUBLE PRECISION,
    "otherDeduction" DOUBLE PRECISION,
    "totalAllowances" DOUBLE PRECISION,
    "totalCommission" DOUBLE PRECISION,
    "totalDeductions" DOUBLE PRECISION,
    "status" TEXT,
    "paid" BOOLEAN,
    "paidDate" TEXT,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "type" TEXT,
    "category" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "approvedBy" TEXT,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountEntry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "AccountEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FranchiseNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "date" TEXT,
    "recipient" TEXT,

    CONSTRAINT "FranchiseNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FranchiseSimVerification" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "simNumber" TEXT NOT NULL,
    "bvs" TEXT NOT NULL,
    "fca" TEXT NOT NULL,
    "ifca" TEXT NOT NULL,
    "verifiedAt" TEXT NOT NULL,

    CONSTRAINT "FranchiseSimVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSOActivation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "simId" TEXT NOT NULL,
    "simNumber" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "iccid" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerCNIC" TEXT NOT NULL,
    "customerMobile" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bvsStatus" TEXT NOT NULL,
    "bvsDate" TEXT NOT NULL,
    "bvsNotes" TEXT NOT NULL,
    "fcaStatus" TEXT NOT NULL,
    "fcaDate" TEXT NOT NULL,
    "fcaNotes" TEXT NOT NULL,
    "ifcaStatus" TEXT NOT NULL,
    "ifcaDate" TEXT NOT NULL,
    "ifcaNotes" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "dsoId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "DSOActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSOAttendance" (
    "id" TEXT NOT NULL,
    "dsoId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "checkIn" TEXT NOT NULL,
    "checkOut" TEXT NOT NULL,
    "gps" TEXT NOT NULL,
    "selfie" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "workingHours" DOUBLE PRECISION,
    "bonus" DOUBLE PRECISION,
    "fine" DOUBLE PRECISION,

    CONSTRAINT "DSOAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "dsoId" TEXT NOT NULL,
    "dsoName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "reviewedAt" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceWarning" (
    "id" TEXT NOT NULL,
    "dsoId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fineAmount" DOUBLE PRECISION NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "AttendanceWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSOWalletEntry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "DSOWalletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSOTargetEntry" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "newSIM" INTEGER NOT NULL,
    "newSIMAchieved" INTEGER NOT NULL,
    "mnp" INTEGER NOT NULL,
    "mnpAchieved" INTEGER NOT NULL,
    "replacement" INTEGER NOT NULL,
    "replacementAchieved" INTEGER NOT NULL,
    "byn" INTEGER NOT NULL,
    "bynAchieved" INTEGER NOT NULL,
    "franchiseId" TEXT NOT NULL,

    CONSTRAINT "DSOTargetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSONotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,

    CONSTRAINT "DSONotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSMActivation" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "simNumber" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerCNIC" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "bvsStatus" TEXT NOT NULL,
    "fcaStatus" TEXT NOT NULL,
    "ifcaStatus" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "dsmId" TEXT NOT NULL,
    "dsoId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "bvsDate" TEXT,
    "bvsNotes" TEXT,
    "fcaDate" TEXT,
    "fcaNotes" TEXT,
    "ifcaDate" TEXT,
    "ifcaNotes" TEXT,

    CONSTRAINT "DSMActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSMTargetEntry" (
    "id" TEXT NOT NULL,
    "dsoId" TEXT NOT NULL,
    "dsoName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "daily" INTEGER NOT NULL,
    "monthly" INTEGER NOT NULL,
    "dailyAchieved" INTEGER NOT NULL,
    "monthlyAchieved" INTEGER NOT NULL,
    "month" TEXT NOT NULL,

    CONSTRAINT "DSMTargetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSMWalletEntry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "DSMWalletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSMNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,

    CONSTRAINT "DSMNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DSMReportSubmission" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "DSMReportSubmission_pkey" PRIMARY KEY ("id")
);
