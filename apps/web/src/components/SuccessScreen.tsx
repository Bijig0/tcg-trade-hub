type SuccessScreenProps = {
  position: number;
  email: string;
  onReset: () => void;
};

export const SuccessScreen = ({ position, email, onReset }: SuccessScreenProps) => {
  return (
    <div className="mx-auto max-w-md text-center py-12 px-4">
      <div className="mb-6 text-6xl">&#127881;</div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        You're in!
      </h2>
      <p className="text-muted-foreground mb-2">
        We've registered <span className="font-medium text-foreground">{email}</span> for early access.
      </p>
      <div className="my-6 rounded-xl bg-primary/10 p-6">
        <p className="text-sm text-muted-foreground mb-1">Your position in your area</p>
        <p className="text-4xl font-bold text-primary">#{position}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        We'll email you when TCG Trade Hub launches in your area.
        Your card listing will be ready to go on day one.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-primary hover:underline"
      >
        Register another email
      </button>
    </div>
  );
};
