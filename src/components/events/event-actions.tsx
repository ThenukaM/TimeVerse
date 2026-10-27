'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEvents } from '@/stores/events';
import type { TimeVerseEvent } from '@/features/events/model';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
export function DeleteEventDialog({
  event,
  open,
  onOpenChange,
  redirect = false,
}: {
  event: TimeVerseEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirect?: boolean;
}) {
  const remove = useEvents((state) => state.remove);
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="dialog-symbol">
          <Trash2 size={23} />
        </div>
        <DialogTitle className="dialog-title">Let this moment go?</DialogTitle>
        <DialogDescription className="dialog-description">
          “{event.title}” will be permanently removed from this browser. This can’t be undone.
        </DialogDescription>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Keep moment
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              remove(event.id);
              onOpenChange(false);
              toast.success('Moment deleted. A little room for what comes next.');
              if (redirect) router.push('/dashboard');
            }}
          >
            Delete moment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function EventActions({ event, full = false }: { event: TimeVerseEvent; full?: boolean }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <>
      {full ? (
        <div className="detail-actions">
          <Button asChild variant="secondary">
            <Link href={`/events/${event.id}/edit`}>
              <Pencil size={15} />
              Edit moment
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => setDeleting(true)} className="danger-text">
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="icon-button card-menu"
            aria-label={`Actions for ${event.title}`}
          >
            <MoreHorizontal size={19} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.id}/edit`}>
                <Pencil size={15} />
                Edit moment
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDeleting(true)}>
              <Trash2 size={15} />
              Delete moment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DeleteEventDialog event={event} open={deleting} onOpenChange={setDeleting} redirect={full} />
    </>
  );
}
