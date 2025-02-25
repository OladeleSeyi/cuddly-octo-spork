"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "next-auth";

// This is sample data.
const data = {
  teams: [
    {
      name: "Lendr",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Deals",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Available Loans",
          url: "/loans",
        },
      ],
    },
    {
      title: "My Loans",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Borrowed",
          url: "/loans/user",
        },
        {
          title: "Investments",
          url: "/loans/user",
        },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: {
  props?: React.ComponentProps<typeof Sidebar>;
  user?: User;
}) {
  const navUser = {
    name: user?.name!,
    email: user?.email!,
    avatar: user?.image || "/avatars/shadcn.jpg",
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
