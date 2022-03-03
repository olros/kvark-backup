import { Badge, BadgeCategory, Group } from 'types';

const WIKI = '/wiki/';
export const WIKI_URLS = {
  ABOUT_INDEX: 'tihlde/undergrupper/index/',
  CONTACT_US: 'kontakt-oss/',
  EVENT_RULES: 'annet/arrangementsregler/',
};

const URLS = {
  badges: {
    index: '/badges/',
    category_relative: 'kategorier/',
    categories: () => `${URLS.badges.index}${URLS.badges.category_relative}`,
    category_leaderboard: (categoryId: BadgeCategory['id']) => `${URLS.badges.categories()}${categoryId}/`,
    category_badges_relative: 'badges/',
    category_badges: (categoryId: BadgeCategory['id']) => `${URLS.badges.category_leaderboard(categoryId)}${URLS.badges.category_badges_relative}`,
    public_badges_relative: 'alle/',
    public_badges: () => `${URLS.badges.index}${URLS.badges.public_badges_relative}`,
    badge_leaderboard: (badgeId: Badge['id']) => `${URLS.badges.index}${badgeId}/`,
    get_badge_relative: 'erverv/',
    get_badge: () => `${URLS.badges.index}${URLS.badges.get_badge_relative}`,
  },
  cheatsheet: '/kokebok/',
  company: '/bedrifter/',
  contactInfo: `${WIKI}${WIKI_URLS.CONTACT_US}`,
  events: '/arrangementer/',
  eventRegister: 'registrering/',
  eventRules: `${WIKI}${WIKI_URLS.EVENT_RULES}`,
  forgotPassword: '/glemt-passord/',
  form: '/sporreskjema/',
  groups: {
    index: '/grupper/',
    details: (groupSlug: Group['slug']) => `${URLS.groups.index}${groupSlug}/`,
    events_relative: 'arrangementer/',
    events: (groupSlug: Group['slug']) => `${URLS.groups.details(groupSlug)}${URLS.groups.events_relative}`,
    fines_relative: 'boter/',
    fines: (groupSlug: Group['slug']) => `${URLS.groups.details(groupSlug)}${URLS.groups.fines_relative}`,
    forms_relative: 'sporreskjema/',
    forms: (groupSlug: Group['slug']) => `${URLS.groups.details(groupSlug)}${URLS.groups.forms_relative}`,
    laws_relative: 'lovverk/',
    laws: (groupSlug: Group['slug']) => `${URLS.groups.details(groupSlug)}${URLS.groups.laws_relative}`,
  },
  jobposts: '/karriere/',
  landing: '/',
  login: '/logg-inn/',
  newStudent: '/ny-student/',
  news: '/nyheter/',
  wiki: WIKI,
  aboutIndex: `${WIKI}${WIKI_URLS.ABOUT_INDEX}`,
  profile: '/profil/',
  signup: '/ny-bruker/',
  shortLinks: '/linker/',

  userAdmin: '/admin/brukere/',
  strikeAdmin: '/admin/prikker/',
  eventAdmin: '/admin/arrangementer/',
  jobpostsAdmin: '/admin/karriere/',
  newsAdmin: '/admin/nyheter/',
};

export default URLS;
