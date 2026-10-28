import { ExitIcon, TicketIcon } from "@/public/icons/icons";
import { UserCircleIcon, WidgetIcon } from "@/components/icons/solar";

export type ProfileMenuItem = {
  labelKey: string;
  descriptionKey: string;
  href?: string;
  icon: React.ReactNode;
  action?: "logout";
  /** Solo se muestra si el usuario puede crear o ya pertenece a una organización. */
  requires?: "organizations";
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
    labelKey: "menu.organizations",
    descriptionKey: "menu.organizationsDesc",
    href: "/organizations",
    icon: <WidgetIcon className="h-5 w-5" />,
    requires: "organizations",
  },
  {
    labelKey: "menu.logout",
    descriptionKey: "menu.logoutDesc",
    icon: <ExitIcon className="h-5 w-5" />,
    action: "logout",
  },
];
