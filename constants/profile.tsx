import { ExitIcon, TicketIcon } from "@/public/icons/icons";
import { UserCircleIcon } from "@/components/icons/solar";

export type ProfileMenuItem = {
  labelKey: string;
  descriptionKey: string;
  href?: string;
  icon: React.ReactNode;
  action?: "logout";
};

export const ProfileMenuItems: ProfileMenuItem[] = [
  {
    labelKey: "menu.profile",
    descriptionKey: "menu.profileDesc",
    href: "/profile",
    icon: <UserCircleIcon className="h-5 w-5" />,
  },
  {
    labelKey: "menu.tickets",
    descriptionKey: "menu.ticketsDesc",
    href: "/tickets",
    icon: <TicketIcon className="h-5 w-5" />,
  },
  {
    labelKey: "menu.logout",
    descriptionKey: "menu.logoutDesc",
    icon: <ExitIcon className="h-5 w-5" />,
    action: "logout",
  },
];
