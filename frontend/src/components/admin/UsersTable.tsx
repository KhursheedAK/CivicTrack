import Link from "next/link";
import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserStatusBadge } from "@/components/shared/UserStatusBadge";
import { formatDate, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface UsersTableProps {
  users: User[];
  onToggleStatus?: (userId: string) => void;
}

export function UsersTable({ users, onToggleStatus }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="Try changing the search or role filters."
        action={
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="h-4 w-4" />
              Add User
            </Link>
          </Button>
        }
      />
    );
  }

  const headClass = "text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[var(--text-muted)]";

  return (
    <Table>
      <TableHeader>
        <TableRow className="dark:border-[var(--border-subtle)]">
          <TableHead className={headClass}>User</TableHead>
          <TableHead className={headClass}>Role</TableHead>
          <TableHead className={headClass}>Department</TableHead>
          <TableHead className={headClass}>Status</TableHead>
          <TableHead className={headClass}>Joined</TableHead>
          <TableHead className={cn(headClass, "text-right")}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[var(--bg-surface-2)]">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  {user.role === "CITIZEN" ? (
                    <Link href={`/admin/citizens/${user.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline dark:text-[var(--text-primary)] dark:hover:text-[var(--brand-accent)]">
                      {user.name}
                    </Link>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{user.name}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{user.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-gray-700 dark:text-[var(--text-secondary)]">{user.role}</TableCell>
            <TableCell className="text-gray-600 dark:text-[var(--text-muted)]">{user.departmentName ?? "Unassigned"}</TableCell>
            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>
            <TableCell className="text-gray-500 dark:text-[var(--text-muted)]">{formatDate(user.joinedAt)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${user.name}`}>
                  <Link href={`/admin/users/${user.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Remove ${user.name}`} />}>
                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove user</DialogTitle>
                      <DialogDescription>
                        {user.name} will be removed and lose access to the portal.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                      <DialogClose render={<Button variant="destructive" onClick={() => onToggleStatus?.(user.id)} />}>
                        Remove
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
