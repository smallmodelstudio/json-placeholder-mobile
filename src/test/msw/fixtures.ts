import type { components } from '@/api';

/** Fixture data for MSW handlers and component tests, shaped like the contract's schemas. */

export const users: components['schemas']['User'][] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' },
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets',
    },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    address: {
      street: 'Victor Plains',
      suite: 'Suite 879',
      city: 'Wisokyburgh',
      zipcode: '90566-7771',
      geo: { lat: '-43.9509', lng: '-34.4618' },
    },
    phone: '010-692-6593 x09125',
    website: 'anastasia.net',
    company: {
      name: 'Deckow-Crist',
      catchPhrase: 'Proactive didactic contingency',
      bs: 'synergize scalable supply-chains',
    },
  },
];

export const posts: components['schemas']['Post'][] = [
  { id: 1, userId: 1, title: 'first post title', body: 'first post body' },
  { id: 2, userId: 1, title: 'second post title', body: 'second post body' },
  { id: 3, userId: 2, title: 'third post title', body: 'third post body' },
];

export const comments: components['schemas']['Comment'][] = [
  {
    id: 1,
    postId: 1,
    name: 'first comment',
    email: 'commenter-one@example.com',
    body: 'great post',
  },
  {
    id: 2,
    postId: 1,
    name: 'second comment',
    email: 'commenter-two@example.com',
    body: 'agreed',
  },
];

export const albums: components['schemas']['Album'][] = [
  { id: 1, userId: 1, title: 'first album' },
  { id: 2, userId: 1, title: 'second album' },
];

export const photos: components['schemas']['Photo'][] = [
  {
    id: 1,
    albumId: 1,
    title: 'first photo',
    url: 'https://via.placeholder.com/600/92c952',
    thumbnailUrl: 'https://via.placeholder.com/150/92c952',
  },
  {
    id: 2,
    albumId: 1,
    title: 'second photo',
    url: 'https://via.placeholder.com/600/771796',
    thumbnailUrl: 'https://via.placeholder.com/150/771796',
  },
];

export const todos: components['schemas']['Todo'][] = [
  { id: 1, userId: 1, title: 'first todo', completed: false },
  { id: 2, userId: 1, title: 'second todo', completed: true },
];
