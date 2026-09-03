"use client";

import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useSearchParams } from "next/navigation";
import StaffRegistration from "@/components/franchise/dashboard/StaffRegistration";

export default function DSOCreatePage() {
  const { auth, dso, dsms, addDSO, updateDSO } = useFranchiseData();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const existing = editId ? dso.find((d) => d.id === editId) || null : null;

  return (
    <StaffRegistration
      kind="DSO"
      auth={auth}
      staffList={dsms}
      existing={existing}
      idPrefix="DSO-"
      usernameBase="dso"
      listHref="/franchise/dso"
      designationOptions={["Direct Sales Officer", "Senior DSO", "Junior DSO", "Trainee DSO"]}
      onSubmit={async (form, isEdit, id) => {
        if (isEdit && id) {
          await updateDSO(id, form);
        } else {
          await addDSO(form);
        }
      }}
    />
  );
}
