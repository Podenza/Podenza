import type { User } from '@supabase/supabase-js';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
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
      <SidebarHeader className="h-16 justify-center p-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="p-2">
            <AppLogo className="max-w-full" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarNavigation
          config={navigationConfig}
          className="space-y-1"
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--border-light)] p-6">
        <ProfileAccountDropdownContainer
          user={props.user}
          account={props.account}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
