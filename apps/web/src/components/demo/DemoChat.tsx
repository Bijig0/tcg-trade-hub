import { useState } from 'react';
import type { NormalizedCard, TcgType, ListingType } from '@tcg-trade-hub/database';
import { SuccessScreen } from '@/components/SuccessScreen';
import { PhoneFrame } from './PhoneFrame';
import { DemoChatHeader } from './DemoChatHeader';
import { DemoMessageBubble } from './DemoMessageBubble';
import { DemoSystemMessage } from './DemoSystemMessage';
import { ReservationCard } from './ReservationCard';
import { TradeEditor } from './TradeEditor';
import { EmailCaptureStep } from './EmailCaptureStep';
import { demoConversation } from './demoConversation';

type Phase = 'chat' | 'trade-editor' | 'email' | 'success';

type SuccessData = {
  position: number;
  email: string;
};

export const DemoChat = () => {
  const [phase, setPhase] = useState<Phase>('chat');
  const [selectedCards, setSelectedCards] = useState<NormalizedCard[]>([]);
  const [tcg, setTcg] = useState<TcgType>('pokemon');
  const [listingType, setListingType] = useState<ListingType>('wtt');
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const handleAddCard = (card: NormalizedCard) => {
    setSelectedCards((prev) => {
      if (prev.some((c) => c.externalId === card.externalId)) return prev;
      return [...prev, card];
    });
  };

  const handleRemoveCard = (externalId: string) => {
    setSelectedCards((prev) => prev.filter((c) => c.externalId !== externalId));
  };

  const handleTcgChange = (newTcg: TcgType) => {
    setTcg(newTcg);
    setSelectedCards([]);
  };

  const handleReset = () => {
    setPhase('chat');
    setSelectedCards([]);
    setTcg('pokemon');
    setListingType('wtt');
    setSuccessData(null);
  };

  return (
    <PhoneFrame>
      {phase === 'chat' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <DemoChatHeader name="TCG Trade Hub" />
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {demoConversation.map((msg) => {
              if (msg.type === 'system') {
                return <DemoSystemMessage key={msg.id} text={msg.text!} />;
              }
              if (msg.type === 'text') {
                return (
                  <DemoMessageBubble
                    key={msg.id}
                    text={msg.text!}
                    sender="other"
                  />
                );
              }
              if (msg.type === 'reservation_card') {
                return (
                  <ReservationCard
                    key={msg.id}
                    onBuildList={() => setPhase('trade-editor')}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {phase === 'trade-editor' && (
        <TradeEditor
          selectedCards={selectedCards}
          tcg={tcg}
          listingType={listingType}
          onTcgChange={handleTcgChange}
          onListingTypeChange={setListingType}
          onAddCard={handleAddCard}
          onRemoveCard={handleRemoveCard}
          onSubmit={() => setPhase('email')}
          onBack={() => setPhase('chat')}
        />
      )}

      {phase === 'email' && (
        <EmailCaptureStep
          selectedCards={selectedCards}
          listingType={listingType}
          onSuccess={(position, email) => {
            setSuccessData({ position, email });
            setPhase('success');
          }}
          onBack={() => setPhase('trade-editor')}
        />
      )}

      {phase === 'success' && successData && (
        <div className="flex flex-1 items-center overflow-y-auto">
          <SuccessScreen
            position={successData.position}
            email={successData.email}
            onReset={handleReset}
          />
        </div>
      )}
    </PhoneFrame>
  );
};
