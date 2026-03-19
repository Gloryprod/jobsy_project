import { Toaster } from "react-hot-toast";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">
    <Toaster
        position="top-right"
        toastOptions={{
        duration: 6000,
        style: { borderRadius: '10px' },
        }}
    />
    {children}
    </div>;
}
