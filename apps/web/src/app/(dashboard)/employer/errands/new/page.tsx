import { getErrandPricingStatus } from "@/actions/errands";
import { getCurrentUser } from "@/actions/auth";
import NewErrandForm from "./NewErrandForm";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post an Errand | Staff Guru",
  description: "Dispatch on-demand verified runners across Nigeria.",
};

export default async function NewErrandPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return <div>Unauthorized</div>;
  }

  const pricing = await getErrandPricingStatus();

  return <NewErrandForm pricing={pricing} />;
}
