import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeIQ — AI Resume Analyzer",
  description:
    "Upload your resume and get an instant ATS score, skill gap analysis, and actionable improvement suggestions powered by ResumeIQ AI.",
  keywords: ["resume analyzer", "ATS score", "skill gap", "AI resume", "job search"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
