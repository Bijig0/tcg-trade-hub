type DemoSystemMessageProps = {
  text: string;
};

export const DemoSystemMessage = ({ text }: DemoSystemMessageProps) => {
  return (
    <div className="flex justify-center px-4">
      <p className="rounded-full bg-secondary/60 px-4 py-1.5 text-center text-xs text-muted-foreground">
        {text}
      </p>
    </div>
  );
};
