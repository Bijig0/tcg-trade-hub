import type { ReactNode } from 'react';

type PhoneFrameProps = {
  children: ReactNode;
};

export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  return (
    <div className="mx-auto flex h-[85vh] max-h-[800px] w-full max-w-[420px] flex-col overflow-hidden rounded-[2.5rem] border-2 border-border bg-background shadow-2xl">
      {/* Status bar */}
      <div className="flex items-center justify-between px-8 pb-1 pt-3 text-xs text-muted-foreground">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          {/* WiFi icon */}
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          {/* Battery icon */}
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
          </svg>
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
