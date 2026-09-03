"use client";

import { useFranchiseData } from "@/lib/FranchiseDataContext";
import { useSearchParams } from "next/navigation";
import StaffRegistration from "@/components/franchise/dashboard/StaffRegistration";

export default function DSMCreatePage() {
  const { auth, dsms, addDSM, updateDSM } = useFranchiseData();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const existing = editId ? dsms.find((d) => d.id === editId) || null : null;

  return (
    <StaffRegistration
      kind="DSM"
      auth={auth}
      staffList={dsms}
      existing={existing}
      idPrefix="DSM-"
      usernameBase="dsm"
      listHref="/franchise/dsm"
      designationOptions={["Area Sales Manager", "Senior DSM", "Junior DSM", "Trainee DSM"]}
      onSubmit={async (form, isEdit, id) => {
        if (isEdit && id) {
          await updateDSM(id, form);
        } else {
          await addDSM(form);
        }
      }}
    />
  );
}
