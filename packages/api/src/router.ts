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
  pipeline: {
    acceptOffer: acceptOfferProcedure,
    declineOffer: declineOfferProcedure,
    completeMeetup: completeMeetupProcedure,
    expireListing: expireListingProcedure,
    createOffer: createOfferProcedure,
  },
};

export type Router = typeof router;
