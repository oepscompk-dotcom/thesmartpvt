"use client";
import React from "react";
import { createPortal } from "react-dom";
import { CheckCircle } from "lucide-react";

interface VerifyPopupProps {
  step: string;
  simNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VerifyConfirmPopup({ step, simNumber, onConfirm, onCancel }: VerifyPopupProps) {
  const color = step === "BVS" ? "amber" : step === "FCA" ? "blue" : "purple";
  const bg = { amber: "bg-amber-50", blue: "bg-blue-50", purple: "bg-purple-50" }[color];
  const iconBg = { amber: "bg-amber-100", blue: "bg-blue-100", purple: "bg-purple-100" }[color];
  const iconText = { amber: "text-amber-600", blue: "text-blue-600", purple: "text-purple-600" }[color];
  const btnBg = { amber: "bg-amber-500 hover:bg-amber-600", blue: "bg-blue-500 hover:bg-blue-600", purple: "bg-purple-500 hover:bg-purple-600" }[color];
  const stepText = { amber: "text-amber-600", blue: "text-blue-600", purple: "text-purple-600" }[color];

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className={`px-6 py-5 text-center ${bg}`}>
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${iconBg}`}>
            <CheckCircle className={`h-8 w-8 ${iconText}`} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#0A2647" }}>Confirm Verify {step}</h3>
        </div>
        <div className="px-6 py-5">
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">SIM Number</span><span className="font-semibold text-gray-800">{simNumber}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Verification</span><span className={`font-bold ${stepText}`}>{step}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Result</span><span className="font-semibold text-green-600">Done (0)</span></div>
          </div>
          <p className="text-sm text-gray-500 text-center mb-5">Are you sure you want to verify this record?</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90 ${btnBg}`}>Confirm</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface VerifySuccessPopupProps {
  message: string;
  onClose: () => void;
}

export function VerifySuccessPopup({ message, onClose }: VerifySuccessPopupProps) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 99999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5 text-center bg-green-50">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "#0A2647" }}>Verification Saved!</h3>
        </div>
        <div className="px-6 py-5 text-center">
          <p className="text-sm text-gray-600 mb-5">{message}</p>
          <button onClick={onClose} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition">OK</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
