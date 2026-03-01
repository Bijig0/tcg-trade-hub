import { Link } from '@tanstack/react-router';

export const DemoMeetupCard = () => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-success/10 px-4 py-2.5">
        <p className="text-xs font-semibold text-success">Meetup Proposal</p>
      </div>

      <div className="space-y-3 p-4">
        {/* Location */}
        <div className="flex items-center gap-2.5">
          <span className="text-lg">&#128205;</span>
          <div>
            <p className="text-sm font-medium text-foreground">Cool Stuff Games</p>
            <p className="text-xs text-muted-foreground">1234 Main St, Orlando, FL</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2.5">
          <span className="text-lg">&#128197;</span>
          <div>
            <p className="text-sm font-medium text-foreground">Saturday, 2:00 PM</p>
            <p className="text-xs text-muted-foreground">Mar 8, 2025</p>
          </div>
        </div>

        {/* Buttons (non-interactive) */}
        <div className="flex gap-2 pt-1">
          <Link
            to="/get-started"
            className="flex-1 rounded-lg border border-success/30 bg-success/10 py-2 text-center text-xs font-medium text-success transition-opacity hover:opacity-80"
          >
            Accept
          </Link>
          <Link
            to="/get-started"
            className="flex-1 rounded-lg border border-border bg-secondary py-2 text-center text-xs font-medium text-muted-foreground transition-opacity hover:opacity-80"
          >
            Suggest New Time
          </Link>
        </div>
      </div>
    </div>
  );
};
