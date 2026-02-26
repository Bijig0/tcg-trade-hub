import { useLocalSearchParams } from 'expo-router';
import OfferDetailScreen from '@/features/chat/components/OfferDetailScreen/OfferDetailScreen';

type OfferDetailParams = {
  conversationId: string;
};

const OfferDetailRoute = () => {
  const params = useLocalSearchParams<OfferDetailParams>();

  return <OfferDetailScreen conversationId={params.conversationId ?? ''} />;
};

export default OfferDetailRoute;
