'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  selectedRole: string;
  onRoleChange: (role: string) => void;
};

export function UserFilter({ selectedRole, onRoleChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedRole}
        onValueChange={(value) => onRoleChange(value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-[180px] border-sky-300 text-sky-600 transition-all hover:border-sky-400 focus:border-sky-400 focus:ring-sky-400">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="rounded-lg border-sky-100 bg-white text-sky-700 shadow-md">
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="store_admin">Store Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
