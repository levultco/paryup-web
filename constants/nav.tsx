import {
  CloudIcon,
  HomeIcon,
  MobileIcon,
  ShopIcon,
  TicketIcon,
} from "@/public/icons/icons";

const Nav = {
  home: {
    label: "Inicio",
    href: "/",
    icon: <HomeIcon className="h-5 w-5 transition" />,
  },
  events: {
    label: "Eventos",
    href: "/events",
    icon: <MobileIcon className="h-5 w-5 transition" />,
  },
};

export const NavItems = Object.values(Nav);

const NavRight = {
  reservations: {
    label: "Mis Entradas",
    href: "/tickets",
    icon: <TicketIcon className="h-5 w-5 transition" />,
  },
};

export const NavRightItems = Object.values(NavRight);
