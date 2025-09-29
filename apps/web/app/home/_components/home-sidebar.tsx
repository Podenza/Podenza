'use client';

import type { User } from '@supabase/supabase-js';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
  useSidebar,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';
import { Tables } from '~/lib/database.types';

export function HomeSidebar(props: {
  account?: Tables<'accounts'>;
  user: User;
}) {
  return (
    <Sidebar
      collapsible={'icon'}
      className="w-64 bg-white border-r border-[var(--border-medium)]"
    >
      <SidebarHeader className="h-16 justify-center p-4 group-data-[collapsible=icon]:p-2">
        <HomeSidebarLogo />
      </SidebarHeader>

      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-2">
        <SidebarNavigation
          config={navigationConfig}
          className="space-y-1"
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--border-light)] p-6 group-data-[collapsible=icon]:p-2">
        <ProfileAccountDropdownContainer
          user={props.user}
          account={props.account}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

function HomeSidebarLogo() {
  const { open } = useSidebar();

  return (
    <div className="flex items-center justify-center w-full">
      <AppLogo
        className="max-w-full"
        collapsed={!open}
      />
    </div>
  );
}
