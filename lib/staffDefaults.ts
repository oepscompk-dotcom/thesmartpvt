import { genPassword } from "./credentials";

export type StaffKind = "DSO" | "DSM";

export interface StaffImportRow {
  name: string;
  fatherName: string;
  cnic: string;
  mobile: string;
  whatsapp: string;
}

/**
 * Builds a full staff record with the same defaults the registration form uses.
 *
 * `assignedDSM` / `assignedFranchise` exist only on the DSO model — sending
 * them to the DSM model makes Prisma reject the whole write with
 * "Unknown argument `assignedDSM`".
 */
export function buildStaffRecord(
  kind: StaffKind,
  row: StaffImportRow,
  ctx: { franchiseId: string; id: string; username: string }
): Record<string, any> {
  const base: Record<string, any> = {
    id: ctx.id,
    name: row.name,
    fatherName: row.fatherName,
    cnic: row.cnic,
    mobile: row.mobile,
    whatsapp: row.whatsapp,
    email: "",
    address: "",
    joiningDate: new Date().toISOString().split("T")[0],
    salary: 0,
    commission: 0,
    username: ctx.username,
    password: genPassword(),
    status: "Active",
    photo: "",
    franchiseId: ctx.franchiseId,
    retailerId: "",
    employeeCode: "",
    dob: "",
    gender: "Male",
    maritalStatus: "Single",
    bloodGroup: "",
    nationality: "Pakistani",
    emergencyContact: "",
    emergencyContactPerson: "",
    emergencyRelationship: "Father",
    province: "Punjab",
    city: "",
    area: "",
    postalCode: "",
    employmentType: "Full Time",
    department: "Sales",
    designation: kind === "DSO" ? "Direct Sales Officer" : "Area Sales Manager",
    reportingManager: "",
    registeredMobile: "",
    otpNumber: "",
    deviceStatus: "Available",
    newSimLimits: { jazz: 0, zong: 0, ufone: 0, telenor: 0 },
    hlrSimLimits: { jazz: 0, zong: 0, ufone: 0, telenor: 0 },
    dailyTargets: { newSIM: 5, mnp: 3, replacement: 2, byn: 1 },
    monthlyTargets: { activations: 150, revenue: 300000, sales: 50 },
    fuelAllowance: 0,
    mobileAllowance: 0,
    dailyAllowance: 0,
    residenceAllowance: 0,
    newSimCommission: 0,
    mnpCommission: 0,
    replacementCommission: 0,
    bynCommission: 0,
    newSimBvs: 0,
    newSimFca: 0,
    newSimIfca: 0,
    mnpBvs: 0,
    mnpFca: 0,
    mnpIfca: 0,
    replacementBvs: 0,
    replacementFca: 0,
    replacementIfca: 0,
    bynBvs: 0,
    bynFca: 0,
    bynIfca: 0,
    hikeCommission: 0,
    otherCommission: 0,
    targetBonus: 0,
    bonus: 0,
    advanceSalary: 0,
    loanDeduction: 0,
    otherDeduction: 0,
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    easypaisaNumber: "",
    jazzcashNumber: "",
    documents: {},
    agreements: {},
    guarantor: {},
    attendanceSettings: { enableGPS: true, selfieVerification: true, locationTracking: true, officeRadius: 500, checkInTime: "09:00", checkOutTime: "18:00" },
    permissions: { newSIM: true, mnp: true, replacement: true, byn: true, wallet: true, attendance: true, reports: true, notifications: true },
  };

  if (kind === "DSO") {
    base.assignedDSM = "";
    base.assignedFranchise = ctx.franchiseId;
  }

  return base;
}
