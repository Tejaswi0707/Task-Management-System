import "./globals.css";

export const metadata = {
  title: "Earnest Tasks",
  description: "Simple tasks app with auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
