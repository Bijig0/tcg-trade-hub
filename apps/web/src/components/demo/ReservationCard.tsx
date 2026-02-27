type ReservationCardProps = {
  onBuildList: () => void;
};

export const ReservationCard = ({ onBuildList }: ReservationCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-primary/10 px-4 py-2.5 flex items-center gap-2">
        <span className="text-sm">&#127919;</span>
        <p className="text-xs font-semibold text-primary">Reserve Your Spot</p>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-xs text-muted-foreground">
          Be first to trade when we launch in your area.
        </p>

        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-foreground">
            <span className="text-success mt-0.5">&#10003;</span>
            <span>Pick the cards you want</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-foreground">
            <span className="text-success mt-0.5">&#10003;</span>
            <span>Get matched with local traders who have them</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-foreground">
            <span className="text-success mt-0.5">&#10003;</span>
            <span>First access at launch</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={onBuildList}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Build Your List
        </button>
      </div>
    </div>
  );
};
