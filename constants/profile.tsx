import { AssistIcon, ExitIcon, UserIcon } from "@/public/icons/icons";
import { LogOut, Ticket, User } from "lucide-react";

export type ProfileMenuItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  action?: "logout";
};

export const ProfileMenuItems: ProfileMenuItem[] = [
  {
    label: "Perfil",
    href: "/profile",
    icon: <UserIcon className="w-5 h-5"/>,
  },
  {
    label: "Asistidas",
    href: "/assisted",
    icon: <AssistIcon className="w-5 h-5"/>,
  },
  {
    label: "Cerrar sesión",
    icon: <ExitIcon className="w-5 h-5"/>,
    action: "logout",
  },
];
