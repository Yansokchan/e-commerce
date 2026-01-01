"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShieldCheckIcon,
  StoreIcon,
  TicketPercentIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

const AdminSidebar = () => {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Products", href: "/admin/products", icon: StoreIcon },
    { name: "Orders", href: "/admin/orders", icon: TicketPercentIcon },
  ];

  return (
    <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
      <div className="max-sm:mt-6">
        {sidebarLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${
              pathname === link.href && "bg-slate-100 sm:text-slate-600"
            }`}
          >
            <link.icon size={18} className="sm:ml-5" />
            <p className="max-sm:hidden">{link.name}</p>
            {pathname === link.href && (
              <span className="absolute bg-pink-500 right-0 h-full top-0 bottom-0 w-1 sm:w-1.5 rounded-l"></span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
