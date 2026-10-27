import { EventDetail } from '@/components/events/event-detail';
export const metadata = { title: 'Your Moment' };
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetail id={id} />;
}
