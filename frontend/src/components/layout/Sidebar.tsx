"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Courses", href: "/courses" },
  { name: "Simulator", href: "/grade-simulator" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col">
      <div className="p-6 text-xl font-bold">Academic</div>

      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium",
                isActive
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
              onClick={(e) => e.preventDefault()}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}