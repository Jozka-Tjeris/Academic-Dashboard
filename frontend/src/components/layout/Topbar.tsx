import { useLogout } from "@/hooks/useAuth";

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const logout  = useLogout();
  
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <button className="w-9 h-9 rounded-full bg-gray-300" onClick={() => logout.mutate()}>
        A
      </button>
    </header>
  );
}