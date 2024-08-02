import { Icon } from "@iconify/react";

import { SideNavItem } from "./types";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Home",
    path: "/",
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: "Whatsapp",
    path: "/whatsapp",
    icon: <Icon icon="lucide:phone" width="24" height="24" />,
  },
  {
    title: "Laporan",
    path: "/laporan",
    icon: <Icon icon="lucide:book-text" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: "Laba Rugi", path: "/laporan/laba-rugi" },
      { title: "Pembukuan", path: "/laporan/pembukuan" },
    ],
  },
  // {
  //   title: "Messages",
  //   path: "/messages",
  //   icon: <Icon icon="lucide:mail" width="24" height="24" />,
  // },
  // {
  //   title: "Settings",
  //   path: "/settings",
  //   icon: <Icon icon="lucide:settings" width="24" height="24" />,
  //   submenu: true,
  //   subMenuItems: [
  //     { title: "Account", path: "/settings/account" },
  //     { title: "Privacy", path: "/settings/privacy" },
  //   ],
  // },
  {
    title: "Kembali",
    path: "http://localhost/kynan/admin/index.php",
    icon: <Icon icon="lucide:arrow-big-left" width="24" height="24" />,
  },
];
