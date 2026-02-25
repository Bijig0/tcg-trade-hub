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
};

export type Router = typeof router;
