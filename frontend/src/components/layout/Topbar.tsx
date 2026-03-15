import { useCheckAuth, useLogout } from "@/hooks/useAuth";
import AccountMenu from "./AccountMenu";

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { data } = useCheckAuth();

  const user = { 
    name: data && data.name !== null ? data.name : "", 
    imageUrl: data ? data.image : null }; // Replace with real user data from context or hook
  
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <AccountMenu name={user.name} imageUrl={user.imageUrl} />
    </header>
  );
}