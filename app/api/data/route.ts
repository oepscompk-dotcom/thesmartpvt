import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MODEL_MAP: Record<string, any> = {
  company: prisma.company,
  franchise: prisma.franchise,
  employee: prisma.employee,
  payment: prisma.payment,
  subscription: prisma.subscription,
  cmsPage: prisma.cMSPage,
  adminNotification: prisma.adminNotification,
  auditLog: prisma.auditLog,
  adminSettings: prisma.adminSettings,
  user: prisma.user,
  dsm: prisma.dSM,
  dso: prisma.dSO,
  device: prisma.device,
  sim: prisma.sIM,
  simIssueRecord: prisma.sIMIssueRecord,
  equipment: prisma.equipment,
  equipmentItemName: prisma.equipmentItemName,
  equipmentIssueRecord: prisma.equipmentIssueRecord,
  deviceIssueRecord: prisma.deviceIssueRecord,
  attendanceRecord: prisma.attendanceRecord,
  target: prisma.target,
  walletTransaction: prisma.walletTransaction,
  payrollRecord: prisma.payrollRecord,
  expense: prisma.expense,
  accountEntry: prisma.accountEntry,
  franchiseNotification: prisma.franchiseNotification,
  bankAccount: prisma.bankAccount,
  franchiseSimVerification: prisma.franchiseSimVerification,
  dsoActivation: prisma.dSOActivation,
  dsoAttendance: prisma.dSOAttendance,
  leaveRequest: prisma.leaveRequest,
  attendanceWarning: prisma.attendanceWarning,
  dsoWalletEntry: prisma.dSOWalletEntry,
  dsoTargetEntry: prisma.dSOTargetEntry,
  dsoNotification: prisma.dSONotification,
  dsmActivation: prisma.dSMActivation,
  dsmTargetEntry: prisma.dSMTargetEntry,
  dsmWalletEntry: prisma.dSMWalletEntry,
  dsmNotification: prisma.dSMNotification,
  dsmReportSubmission: prisma.dSMReportSubmission,
  franchiseData: prisma.franchiseData,
};

function getModel(name: string) {
  const model = MODEL_MAP[name];
  if (!model) throw new Error(`Unknown model: ${name}`);
  return model;
}

// GET /api/data?model=xxx&franchiseId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelName = searchParams.get("model");
    const franchiseId = searchParams.get("franchiseId");
    const id = searchParams.get("id");

    if (!modelName) return NextResponse.json({ error: "model required" }, { status: 400 });

    const model = getModel(modelName);

    if (id) {
      const record = await model.findUnique({ where: { id } });
      return NextResponse.json(record || null);
    }

    const where: any = {};
    if (franchiseId) where.franchiseId = franchiseId;

    const records = await model.findMany({ where, orderBy: { id: "asc" } });
    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/data  { model, data, franchiseId? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model: modelName, data, franchiseId } = body;

    if (!modelName || !data) return NextResponse.json({ error: "model and data required" }, { status: 400 });

    const model = getModel(modelName);

    // Bulk create
    if (Array.isArray(data)) {
      const records = await model.createMany({ data });
      return NextResponse.json({ count: records.count });
    }

    // Single create
    const record = await model.create({ data });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/data  { model, id, data } or { model, ids[], data }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { model: modelName, id, ids, data } = body;

    if (!modelName || !data) return NextResponse.json({ error: "model and data required" }, { status: 400 });

    const model = getModel(modelName);

    // Bulk update
    if (ids && Array.isArray(ids)) {
      const results = await Promise.all(ids.map((i: string) => model.update({ where: { id: i }, data })));
      return NextResponse.json({ count: results.length });
    }

    // Single update
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const record = await model.update({ where: { id }, data });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/data  { model, id } or { model, ids[] }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { model: modelName, id, ids } = body;

    if (!modelName) return NextResponse.json({ error: "model required" }, { status: 400 });

    const model = getModel(modelName);

    // Bulk delete
    if (ids && Array.isArray(ids)) {
      const results = await Promise.all(ids.map((i: string) => model.delete({ where: { id: i } })));
      return NextResponse.json({ count: results.length });
    }

    // Single delete
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await model.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
