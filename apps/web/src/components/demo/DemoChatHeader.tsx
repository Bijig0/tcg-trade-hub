type DemoChatHeaderProps = {
  name: string;
};

export const DemoChatHeader = ({ name }: DemoChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
      {/* Avatar */}
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-success">Online</p>
      </div>
    </div>
  );
};
