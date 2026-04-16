import { DashboardFrame } from "@/components/layout/dashboard-frame";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardFrame>{children}</DashboardFrame>
  );
}
