import { create } from './procedures/preRegistration';
import { search } from './procedures/cardSearch';
import { register as shopRegister } from './procedures/shop/register';
import { get as shopGet } from './procedures/shop/get';
import { update as shopUpdate } from './procedures/shop/update';
import { create as shopEventCreate } from './procedures/shop/events/create';
import { list as shopEventList } from './procedures/shop/events/list';
import { update as shopEventUpdate } from './procedures/shop/events/update';
import { remove as shopEventRemove } from './procedures/shop/events/remove';
import { list as shopNotificationList } from './procedures/shop/notifications/list';
import { markRead as shopNotificationMarkRead } from './procedures/shop/notifications/markRead';
import { acceptOfferProcedure } from './procedures/pipelines/acceptOffer';
import { declineOfferProcedure } from './procedures/pipelines/declineOffer';
import { completeMeetupProcedure } from './procedures/pipelines/completeMeetup';
import { expireListingProcedure } from './procedures/pipelines/expireListing';
import { createOfferProcedure } from './procedures/pipelines/createOffer';
import { sendMessageProcedure } from './procedures/pipelines/sendMessage';
import { list as collectionList } from './procedures/collection/list';
import { add as collectionAdd } from './procedures/collection/add';
import { batchAdd as collectionBatchAdd } from './procedures/collection/batchAdd';
import { update as collectionUpdate } from './procedures/collection/update';
import { remove as collectionRemove } from './procedures/collection/remove';
import { portfolioSummary as collectionPortfolioSummary } from './procedures/collection/portfolioSummary';
import { myList as listingMyList } from './procedures/listing/myList';
import { get as listingGet } from './procedures/listing/get';
import { create as listingCreate } from './procedures/listing/create';
import { list as listingOffersList } from './procedures/listing/offers/list';

export const router = {
  preRegistration: { create },
  card: { search },
  shop: {
    register: shopRegister,
    get: shopGet,
    update: shopUpdate,
    events: {
      create: shopEventCreate,
      list: shopEventList,
      update: shopEventUpdate,
      remove: shopEventRemove,
    },
    notifications: {
      list: shopNotificationList,
      markRead: shopNotificationMarkRead,
    },
  },
  collection: {
    list: collectionList,
    add: collectionAdd,
    batchAdd: collectionBatchAdd,
    update: collectionUpdate,
    remove: collectionRemove,
    portfolioSummary: collectionPortfolioSummary,
  },
  listing: {
    myList: listingMyList,
    get: listingGet,
    create: listingCreate,
    offers: {
      list: listingOffersList,
    },
  },
  pipeline: {
    acceptOffer: acceptOfferProcedure,
    declineOffer: declineOfferProcedure,
    completeMeetup: completeMeetupProcedure,
    expireListing: expireListingProcedure,
    createOffer: createOfferProcedure,
    sendMessage: sendMessageProcedure,
  },
};

export type Router = typeof router;
