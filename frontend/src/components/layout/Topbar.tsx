interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="w-9 h-9 rounded-full bg-gray-300" />
    </header>
  );
}