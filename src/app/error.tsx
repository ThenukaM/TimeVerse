'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state standalone">
      <h1>Let’s take a breath.</h1>
      <p>
        Something went wrong while opening this page. Your saved moments are still in your browser.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
