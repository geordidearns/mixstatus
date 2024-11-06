import React from "react";
import { Activity } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem className="font-mono">
								<SidebarMenuButton asChild>
									<a href={"#"}>
										<Activity />
										<span>Services</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<ThemeToggle />
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
