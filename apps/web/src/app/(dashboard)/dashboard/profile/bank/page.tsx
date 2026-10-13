import { getCurrentUser } from "@/actions/auth";
import { getWorkerBankDetails } from "@/actions/bank";
import { redirect } from "next/navigation";
import BankProfileClient from "./BankProfileClient";

export const metadata = {
  title: "Bank Account on File | Staff Guru",
  description: "Manage your payout bank account for Alabaru errands.",
};

export default async function WorkerBankProfilePage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") {
    redirect("/login");
  }

  const bankData = await getWorkerBankDetails();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BankProfileClient
        initialBank={bankData.bankAccount || null}
        openToErrands={bankData.openToErrands ?? false}
      />
    </div>
  );
}
