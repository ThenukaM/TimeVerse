import type { Metadata } from 'next';
import { EventForm } from '@/components/events/event-form';
export const metadata: Metadata = { title: 'A New Moment' };
export default function NewEventPage() {
  return <EventForm />;
}
