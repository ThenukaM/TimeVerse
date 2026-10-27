import Link from 'next/link';
import { Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFound() {
  return (
    <div className="empty-state standalone">
      <Orbit size={40} />
      <h1>A moment out of place.</h1>
      <p>This page doesn’t exist. Your moments are waiting on the dashboard.</p>
      <Button asChild>
        <Link href="/dashboard">Back to your moments</Link>
      </Button>
    </div>
  );
}
