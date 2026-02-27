type DemoMessageBubbleProps = {
  text: string;
  sender: 'other' | 'own';
};

export const DemoMessageBubble = ({ text, sender }: DemoMessageBubbleProps) => {
  const isOwn = sender === 'own';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isOwn
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-secondary text-foreground'
        }`}
      >
        {text}
      </div>
    </div>
  );
};
