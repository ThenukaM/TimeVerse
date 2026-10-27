'use client';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content className="dropdown-content" align="end" sideOffset={8}>
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}
export function DropdownMenuItem(props: React.ComponentProps<typeof DropdownPrimitive.Item>) {
  return <DropdownPrimitive.Item className="dropdown-item" {...props} />;
}
