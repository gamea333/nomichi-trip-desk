import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nomichi | Find your next trip",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
