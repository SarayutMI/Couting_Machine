export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {children}
    </div>
  );
}
