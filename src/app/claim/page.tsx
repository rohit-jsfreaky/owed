import type { Metadata } from "next";
import { Ledger } from "@/components/Ledger";

export const metadata: Metadata = { title: "Check a vendor · Owed" };

export default function ClaimPage() {
  return <Ledger />;
}
