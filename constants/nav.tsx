import {
  CloudIcon,
  HomeIcon,
  MobileIcon,
  ShopIcon,
  TicketIcon,
} from "@/public/icons/icons";
import { WidgetIcon } from "@/components/icons/solar";

const Nav = {
  home: {
    labelKey: "nav.home",
    href: "/",
    icon: <HomeIcon className="h-5 w-5 transition" />,
  },
  events: {
    labelKey: "nav.events",
    href: "/events",
    icon: <MobileIcon className="h-5 w-5 transition" />,
  },
  backstage: {
    labelKey: "nav.backstage",
    href: "/backstage",
    icon: <WidgetIcon className="h-5 w-5 transition" />,
  },
};

export const NavItems = Object.values(Nav);

const NavRight = {
  reservations: {
    labelKey: "nav.tickets",
    href: "/tickets",
    icon: <TicketIcon className="h-5 w-5 transition" />,
  },
};

export const NavRightItems = Object.values(NavRight);
