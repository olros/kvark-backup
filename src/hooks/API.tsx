/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth0 } from '@auth0/auth0-react';
import { TIHLDE_API_URL } from 'constant';
import { argsToParams } from 'utils';

import {
  Badge,
  BadgeCategory,
  BadgeLeaderboard,
  BadgesOverallLeaderboard,
  Category,
  Cheatsheet,
  CompaniesEmail,
  Event,
  EventFavorite,
  EventList,
  EventMutate,
  EventStatistics,
  FileUploadResponse,
  Form,
  FormCreate,
  FormStatistics,
  FormUpdate,
  Gallery,
  GalleryCreate,
  Group,
  GroupFine,
  GroupFineBatchMutate,
  GroupFineCreate,
  GroupFineDefenseMutate,
  GroupFineMutate,
  GroupFineStatistics,
  GroupForm,
  GroupLaw,
  GroupLawMutate,
  GroupList,
  GroupMemberStatistics,
  GroupMutate,
  GroupUserFine,
  JobPost,
  JobPostRequired,
  Membership,
  MembershipHistory,
  MembershipHistoryMutate,
  News,
  NewsRequired,
  Notification,
  PaginationResponse,
  Picture,
  PublicRegistration,
  Registration,
  RequestResponse,
  ShortLink,
  Strike,
  StrikeCreate,
  StrikeList,
  Submission,
  Toddel,
  ToddelMutate,
  User,
  UserNotificationSetting,
  UserNotificationSettingChoice,
  UserPermissions,
  UserSubmission,
  Warning,
  WikiChildren,
  WikiPage,
  WikiRequired,
  WikiTree,
} from 'types';
import { CheatsheetStudy, MembershipType } from 'types/Enums';

export const BADGES_ENDPOINT = 'badges';
export const BADGES_LEADERBOARD_ENDPOINT = 'leaderboard';
export const BADGE_CATEGORIES_ENDPOINT = 'categories';
export const CATEGORIES_ENDPOINT = 'categories';
export const CHEATSHEETS_ENDPOINT = 'cheatsheets';
export const EVENTS_ENDPOINT = 'events';
export const EVENT_REGISTRATIONS_ENDPOINT = 'registrations';
export const FORMS_ENDPOINT = 'forms';
export const GALLERY_ENDPOINT = 'galleries';
export const PICTURE_ENDPOINT = 'pictures';
export const GROUPS_ENDPOINT = 'groups';
export const GROUP_LAWS_ENDPOINT = 'laws';
export const GROUP_FINES_ENDPOINT = 'fines';
export const JOBPOSTS_ENDPOINT = 'jobposts';
export const ME_ENDPOINT = 'me';
export const MEMBERSHIPS_ENDPOINT = 'memberships';
export const MEMBERSHIP_HISTORIES_ENDPOINT = 'membership-histories';
export const NEWS_ENDPOINT = 'news';
export const NOTIFICATIONS_ENDPOINT = 'notifications';
export const NOTIFICATION_SETTINGS_ENDPOINT = 'notification-settings';
export const WIKI_ENDPOINT = 'pages';
export const SHORT_LINKS_ENDPOINT = 'short-links';
export const STRIKES_ENDPOINT = 'strikes';
export const SUBMISSIONS_ENDPOINT = 'submissions';
export const USERS_ENDPOINT = 'users';
export const WARNINGS_ENDPOINT = 'warnings';
export const TODDEL_ENDPOINT = 'toddel';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function ApiFetch<T>({
  method,
  endpoint,
  token,
  data = {},
  files,
}: {
  method: RequestMethod;
  endpoint: string;
  token?: string;
  data?: Record<string, unknown | any>;
  files?: File | File[] | Blob;
}) {
  const url = TIHLDE_API_URL + endpoint;

  // Construct request headers
  const headers = new Headers();
  if (!files) {
    headers.append('Content-Type', 'application/json');
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Construct request body
  const isGetRequest = method === 'GET';
  let body;
  if (files) {
    const data = new FormData();

    if (Array.isArray(files)) {
      files.forEach((f) => data.append('file', f));
    } else {
      data.append('file', files);
    }

    body = data;
  } else {
    body = isGetRequest ? null : JSON.stringify(data);
  }

  // Create request using url, method, headers and body
  const request = new Request(isGetRequest ? url + argsToParams(data) : url, {
    method: method,
    headers: headers,
    body: body,
  });

  // Send request and parse response
  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';
  const json = await response.json();

  // Return JSON object casted to expected type on success
  if (response.ok && contentType.includes('application/json') && json) {
    return json as T;
  }

  // Throw JSON object as response on failure
  throw (json || { detail: response.statusText }) as RequestResponse;
}

export const useAPI = () => {
  const { getAccessTokenSilently } = useAuth0();

  return {
    //
    // News
    //
    getNewsItem: async (id: number) => ApiFetch<News>({ method: 'GET', endpoint: `${NEWS_ENDPOINT}/${String(id)}/`, token: await getAccessTokenSilently() }),

    getNewsItems: async (filters?: any) =>
      ApiFetch<PaginationResponse<News>>({ method: 'GET', endpoint: `${NEWS_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    createNewsItem: async (item: NewsRequired) =>
      ApiFetch<News>({ method: 'POST', endpoint: `${NEWS_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    putNewsItem: async (id: number, item: NewsRequired) =>
      ApiFetch<News>({ method: 'PUT', endpoint: `${NEWS_ENDPOINT}/${String(id)}/`, data: item, token: await getAccessTokenSilently() }),

    deleteNewsItem: async (id: number) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${NEWS_ENDPOINT}/${String(id)}/`, token: await getAccessTokenSilently() }),

    //
    // Job Posts
    //
    getJobPosts: async (filters: any = {}) =>
      ApiFetch<PaginationResponse<JobPost>>({ method: 'GET', endpoint: `${JOBPOSTS_ENDPOINT}/`, data: filters, token: await getAccessTokenSilently() }),

    getJobPost: async (id: number) =>
      ApiFetch<JobPost>({ method: 'GET', endpoint: `${JOBPOSTS_ENDPOINT}/${String(id)}/`, token: await getAccessTokenSilently() }),

    createJobPost: async (item: JobPostRequired) =>
      ApiFetch<JobPost>({ method: 'POST', endpoint: `${JOBPOSTS_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    putJobPost: async (id: number, item: JobPostRequired) =>
      ApiFetch<JobPost>({ method: 'PUT', endpoint: `${JOBPOSTS_ENDPOINT}/${String(id)}/`, data: item, token: await getAccessTokenSilently() }),

    deleteJobPost: async (id: number) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${JOBPOSTS_ENDPOINT}/${String(id)}/`, token: await getAccessTokenSilently() }),

    //
    // Wiki
    //
    getWikiTree: async () => ApiFetch<WikiTree>({ method: 'GET', endpoint: `${WIKI_ENDPOINT}/tree/`, token: await getAccessTokenSilently() }),

    getWikiPage: async (path: string) => ApiFetch<WikiPage>({ method: 'GET', endpoint: `${WIKI_ENDPOINT}/${path}`, token: await getAccessTokenSilently() }),

    getWikiSearch: async (filters: any) =>
      ApiFetch<PaginationResponse<WikiChildren>>({ method: 'GET', endpoint: `${WIKI_ENDPOINT}/`, data: filters, token: await getAccessTokenSilently() }),

    createWikiPage: async (data: WikiRequired) =>
      ApiFetch<WikiPage>({ method: 'POST', endpoint: `${WIKI_ENDPOINT}/`, data, token: await getAccessTokenSilently() }),

    updateWikiPage: async (path: string, data: Partial<WikiPage>) =>
      ApiFetch<WikiPage>({ method: 'PUT', endpoint: `${WIKI_ENDPOINT}/${path}`, data, token: await getAccessTokenSilently() }),

    deleteWikiPage: async (path: string) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${WIKI_ENDPOINT}/${path}`, token: await getAccessTokenSilently() }),

    //
    // User
    //
    getUserData: async (userId?: User['user_id']) =>
      ApiFetch<User>({ method: 'GET', endpoint: `${USERS_ENDPOINT}/${userId || 'me'}`, token: await getAccessTokenSilently() }),

    getUserPermissions: async () =>
      ApiFetch<UserPermissions>({ method: 'GET', endpoint: `${USERS_ENDPOINT}/${ME_ENDPOINT}/permissions/`, token: await getAccessTokenSilently() }),

    getUserBadges: async (userId?: User['user_id'], filters?: any) =>
      ApiFetch<PaginationResponse<Badge>>({
        method: 'GET',
        endpoint: `${USERS_ENDPOINT}/${userId || ME_ENDPOINT}/${BADGES_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getUserEvents: async (userId?: User['user_id'], filters?: any) =>
      ApiFetch<PaginationResponse<EventList>>({
        method: 'GET',
        endpoint: `${USERS_ENDPOINT}/${userId || ME_ENDPOINT}/${EVENTS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getUserForms: async (filters?: any) =>
      ApiFetch<PaginationResponse<Form>>({
        method: 'GET',
        endpoint: `${USERS_ENDPOINT}/${ME_ENDPOINT}/${FORMS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getUserMemberships: async (userId?: User['user_id']) =>
      ApiFetch<PaginationResponse<Membership>>({
        method: 'GET',
        endpoint: `${USERS_ENDPOINT}/${userId || ME_ENDPOINT}/${MEMBERSHIPS_ENDPOINT}/`,
        token: await getAccessTokenSilently(),
      }),

    getUserMembershipHistories: async (userId?: User['user_id']) =>
      ApiFetch<PaginationResponse<MembershipHistory>>({
        method: 'GET',
        endpoint: `${USERS_ENDPOINT}/${userId || ME_ENDPOINT}/${MEMBERSHIP_HISTORIES_ENDPOINT}/`,
        token: await getAccessTokenSilently(),
      }),

    getUserStrikes: async (userId?: User['user_id']) =>
      ApiFetch<Array<Strike>>({
        method: 'GET',
        endpoint: `${USERS_ENDPOINT}/${userId || ME_ENDPOINT}/${STRIKES_ENDPOINT}/`,
        token: await getAccessTokenSilently(),
      }),

    getUsers: async (filters?: any) =>
      ApiFetch<PaginationResponse<User>>({ method: 'GET', endpoint: `${USERS_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    updateUserData: async (userName: User['user_id'], item: Partial<User>) =>
      ApiFetch<User>({ method: 'PUT', endpoint: `${USERS_ENDPOINT}/${userName}/`, data: item, token: await getAccessTokenSilently() }),

    getUserNotificationSettings: async () =>
      ApiFetch<Array<UserNotificationSetting>>({ method: 'GET', endpoint: `${NOTIFICATION_SETTINGS_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    updateUserNotificationSettings: async (data: UserNotificationSetting) =>
      ApiFetch<Array<UserNotificationSetting>>({
        method: 'POST',
        endpoint: `${NOTIFICATION_SETTINGS_ENDPOINT}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    getUserNotificationSettingChoices: async () =>
      ApiFetch<Array<UserNotificationSettingChoice>>({
        method: 'GET',
        endpoint: `${NOTIFICATION_SETTINGS_ENDPOINT}/choices/`,
        token: await getAccessTokenSilently(),
      }),

    slackConnect: async (slackCode: string) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${USERS_ENDPOINT}/${ME_ENDPOINT}/slack/`,
        data: { code: slackCode },
        token: await getAccessTokenSilently(),
      }),

    activateUser: async (userName: User['user_id']) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${USERS_ENDPOINT}/activate/`,
        data: { user_id: userName },
        token: await getAccessTokenSilently(),
      }),

    declineUser: async (userName: User['user_id'], reason: string) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${USERS_ENDPOINT}/decline/`,
        data: { user_id: userName, reason },
        token: await getAccessTokenSilently(),
      }),

    exportUserData: async () =>
      ApiFetch<RequestResponse>({ method: 'GET', endpoint: `${USERS_ENDPOINT}/${ME_ENDPOINT}/data/`, token: await getAccessTokenSilently() }),

    deleteUser: async (userId?: User['user_id']) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${USERS_ENDPOINT}/${userId || ME_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    //
    // Groups
    //
    getGroups: async (filters?: any) =>
      ApiFetch<GroupList[]>({ method: 'GET', endpoint: `${GROUPS_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    getGroup: async (slug: Group['slug']) => ApiFetch<Group>({ method: 'GET', endpoint: `${GROUPS_ENDPOINT}/${slug}/`, token: await getAccessTokenSilently() }),

    getGroupStatistics: async (slug: Group['slug']) =>
      ApiFetch<GroupMemberStatistics>({ method: 'GET', endpoint: `${GROUPS_ENDPOINT}/${slug}/statistics/`, token: await getAccessTokenSilently() }),

    updateGroup: async (slug: Group['slug'], data: GroupMutate) =>
      ApiFetch<Group>({ method: 'PUT', endpoint: `${GROUPS_ENDPOINT}/${slug}/`, data, token: await getAccessTokenSilently() }),

    getGroupForms: async (slug: string) =>
      ApiFetch<Array<GroupForm>>({ method: 'GET', endpoint: `${GROUPS_ENDPOINT}/${slug}/${FORMS_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    // Group Memberships
    getMemberships: async (groupSlug: Group['slug'], filters?: any) =>
      ApiFetch<PaginationResponse<Membership>>({
        method: 'GET',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIPS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getMembershipsHistories: async (groupSlug: Group['slug'], filters?: any) =>
      ApiFetch<PaginationResponse<MembershipHistory>>({
        method: 'GET',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIP_HISTORIES_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    createMembership: async (groupSlug: Group['slug'], userId: User['user_id']) =>
      ApiFetch<Membership>({
        method: 'POST',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIPS_ENDPOINT}/`,
        data: { user: { user_id: userId } },
        token: await getAccessTokenSilently(),
      }),

    deleteMembership: async (groupSlug: Group['slug'], userId: User['user_id']) =>
      ApiFetch<RequestResponse>({
        method: 'DELETE',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIPS_ENDPOINT}/${userId}/`,
        token: await getAccessTokenSilently(),
      }),

    updateMembership: async (groupSlug: Group['slug'], userId: User['user_id'], data: { membership_type: MembershipType }) =>
      ApiFetch<Membership>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIPS_ENDPOINT}/${userId}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    deleteMembershipHistory: async (groupSlug: Group['slug'], id: MembershipHistory['id']) =>
      ApiFetch<RequestResponse>({
        method: 'DELETE',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIP_HISTORIES_ENDPOINT}/${id}/`,
        token: await getAccessTokenSilently(),
      }),

    updateMembershipHistory: async (groupSlug: Group['slug'], id: MembershipHistory['id'], data: MembershipHistoryMutate) =>
      ApiFetch<MembershipHistory>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${MEMBERSHIP_HISTORIES_ENDPOINT}/${id}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    // Group laws
    getGroupLaws: async (groupSlug: Group['slug']) =>
      ApiFetch<Array<GroupLaw>>({ method: 'GET', endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_LAWS_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    createGroupLaw: async (groupSlug: Group['slug'], data: GroupLawMutate) =>
      ApiFetch<GroupLaw>({ method: 'POST', endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_LAWS_ENDPOINT}/`, data, token: await getAccessTokenSilently() }),

    updateGroupLaw: async (groupSlug: Group['slug'], lawId: GroupLaw['id'], data: GroupLawMutate) =>
      ApiFetch<GroupLaw>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_LAWS_ENDPOINT}/${lawId}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    deleteGroupLaw: async (groupSlug: Group['slug'], lawId: GroupLaw['id']) =>
      ApiFetch<RequestResponse>({
        method: 'DELETE',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_LAWS_ENDPOINT}/${lawId}/`,
        token: await getAccessTokenSilently(),
      }),

    // Group fines
    getGroupFines: async (groupSlug: Group['slug'], filters?: any) =>
      ApiFetch<PaginationResponse<GroupFine>>({
        method: 'GET',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getGroupFinesStatistics: async (groupSlug: Group['slug']) =>
      ApiFetch<GroupFineStatistics>({
        method: 'GET',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/statistics/`,
        token: await getAccessTokenSilently(),
      }),

    getGroupUsersFines: async (groupSlug: Group['slug'], filters?: any) =>
      ApiFetch<PaginationResponse<GroupUserFine>>({
        method: 'GET',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/${USERS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getGroupUserFines: async (groupSlug: Group['slug'], userId: User['user_id'], filters?: any) =>
      ApiFetch<PaginationResponse<GroupFine>>({
        method: 'GET',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/${USERS_ENDPOINT}/${userId}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    createGroupFine: async (groupSlug: Group['slug'], data: GroupFineCreate) =>
      ApiFetch<GroupFine>({
        method: 'POST',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    updateGroupFine: async (groupSlug: Group['slug'], fineId: GroupFine['id'], data: GroupFineMutate) =>
      ApiFetch<GroupFine>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/${fineId}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    updateGroupFineDefense: async (groupSlug: Group['slug'], fineId: GroupFine['id'], data: GroupFineDefenseMutate) =>
      ApiFetch<GroupFine>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/${fineId}/defense/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    batchUpdateGroupFine: async (groupSlug: Group['slug'], data: GroupFineBatchMutate) =>
      ApiFetch<RequestResponse>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/batch-update/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    batchUpdateUserGroupFines: async (groupSlug: Group['slug'], userId: User['user_id'], data: GroupFineMutate) =>
      ApiFetch<RequestResponse>({
        method: 'PUT',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/batch-update/${userId}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    deleteGroupFine: async (groupSlug: Group['slug'], fineId: GroupFine['id']) =>
      ApiFetch<RequestResponse>({
        method: 'DELETE',
        endpoint: `${GROUPS_ENDPOINT}/${groupSlug}/${GROUP_FINES_ENDPOINT}/${fineId}/`,
        token: await getAccessTokenSilently(),
      }),

    //
    // Events
    //
    getCategories: async () => ApiFetch<Array<Category>>({ method: 'GET', endpoint: `${CATEGORIES_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    createStrike: async (item: StrikeCreate) =>
      ApiFetch<Strike>({ method: 'POST', endpoint: `${STRIKES_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    deleteStrike: async (id: string) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${STRIKES_ENDPOINT}/${id}/`, token: await getAccessTokenSilently() }),

    getStrikes: async (filters?: any) =>
      ApiFetch<PaginationResponse<StrikeList>>({ method: 'GET', endpoint: `${STRIKES_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    getEvent: async (eventId: Event['id']) =>
      ApiFetch<Event>({ method: 'GET', endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/`, token: await getAccessTokenSilently() }),

    getEventStatistics: async (eventId: Event['id']) =>
      ApiFetch<EventStatistics>({ method: 'GET', endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/statistics/`, token: await getAccessTokenSilently() }),

    getEvents: async (filters?: any) =>
      ApiFetch<PaginationResponse<EventList>>({ method: 'GET', endpoint: `${EVENTS_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    getEventsWhereIsAdmin: async (filters?: any) =>
      ApiFetch<PaginationResponse<EventList>>({
        method: 'GET',
        endpoint: `${EVENTS_ENDPOINT}/admin/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    createEvent: async (item: EventMutate) =>
      ApiFetch<Event>({ method: 'POST', endpoint: `${EVENTS_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    updateEvent: async (eventId: Event['id'], item: EventMutate) =>
      ApiFetch<Event>({ method: 'PUT', endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/`, data: item, token: await getAccessTokenSilently() }),

    deleteEvent: async (eventId: Event['id']) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/`, token: await getAccessTokenSilently() }),

    notifyEventRegistrations: async (eventId: Event['id'], title: string, message: string) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/notify/`,
        data: { title, message },
        token: await getAccessTokenSilently(),
      }),

    getPublicEventRegistrations: async (eventId: Event['id'], filters?: any) =>
      ApiFetch<PaginationResponse<PublicRegistration>>({
        method: 'GET',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/public_registrations/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    sendGiftCardsToAttendees: async (eventId: Event['id'], files: File | File[] | Blob) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/mail-gift-cards/`,
        files: files,
        token: await getAccessTokenSilently(),
      }),

    getEventIsFavorite: async (eventId: Event['id']) =>
      ApiFetch<EventFavorite>({ method: 'GET', endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/favorite/`, token: await getAccessTokenSilently() }),

    setEventIsFavorite: async (eventId: Event['id'], data: EventFavorite) =>
      ApiFetch<EventFavorite>({ method: 'PUT', endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/favorite/`, data, token: await getAccessTokenSilently() }),

    // Event Registrations
    getRegistration: async (eventId: Event['id'], userId: User['user_id']) =>
      ApiFetch<Registration>({
        method: 'GET',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/${EVENT_REGISTRATIONS_ENDPOINT}/${userId}/`,
        token: await getAccessTokenSilently(),
      }),

    getEventRegistrations: async (eventId: Event['id'], filters?: any) =>
      ApiFetch<PaginationResponse<Registration>>({
        method: 'GET',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/${EVENT_REGISTRATIONS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    createRegistration: async (eventId: Event['id'], item: Partial<Registration>) =>
      ApiFetch<Registration>({
        method: 'POST',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/${EVENT_REGISTRATIONS_ENDPOINT}/`,
        data: item,
        token: await getAccessTokenSilently(),
      }),

    updateRegistration: async (eventId: Event['id'], item: Partial<Registration>, userId: User['user_id']) =>
      ApiFetch<Registration>({
        method: 'PUT',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/${EVENT_REGISTRATIONS_ENDPOINT}/${userId}/`,
        data: item,
        token: await getAccessTokenSilently(),
      }),

    deleteRegistration: async (eventId: Event['id'], userId: User['user_id']) =>
      ApiFetch<RequestResponse>({
        method: 'DELETE',
        endpoint: `${EVENTS_ENDPOINT}/${String(eventId)}/${EVENT_REGISTRATIONS_ENDPOINT}/${userId}/`,
        token: await getAccessTokenSilently(),
      }),

    //
    // Forms
    //
    getForm: async (formId: string) => ApiFetch<Form>({ method: 'GET', endpoint: `${FORMS_ENDPOINT}/${formId}/`, token: await getAccessTokenSilently() }),

    getFormTemplates: async () => ApiFetch<Array<Form>>({ method: 'GET', endpoint: `${FORMS_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    getFormStatistics: async (formId: string) =>
      ApiFetch<FormStatistics>({ method: 'GET', endpoint: `${FORMS_ENDPOINT}/${formId}/statistics/`, token: await getAccessTokenSilently() }),

    createForm: async (item: FormCreate) =>
      ApiFetch<Form>({ method: 'POST', endpoint: `${FORMS_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    updateForm: async (formId: string, item: FormUpdate) =>
      ApiFetch<Form>({ method: 'PUT', endpoint: `${FORMS_ENDPOINT}/${formId}/`, data: item, token: await getAccessTokenSilently() }),

    deleteForm: async (formId: string) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${FORMS_ENDPOINT}/${formId}/`, token: await getAccessTokenSilently() }),

    // Form submissions
    getSubmissions: async (formId: string, filters?: any) =>
      ApiFetch<PaginationResponse<UserSubmission>>({
        method: 'GET',
        endpoint: `${FORMS_ENDPOINT}/${formId}/${SUBMISSIONS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    createSubmission: async (formId: string, submission: Submission) =>
      ApiFetch<Submission>({
        method: 'POST',
        endpoint: `${FORMS_ENDPOINT}/${formId}/${SUBMISSIONS_ENDPOINT}/`,
        data: submission,
        token: await getAccessTokenSilently(),
      }),

    //
    // Badge
    //
    getBadge: async (badgeId: Badge['id']) =>
      ApiFetch<Badge>({ method: 'GET', endpoint: `${BADGES_ENDPOINT}/${badgeId}/`, token: await getAccessTokenSilently() }),

    getBadges: async (filters?: any) =>
      ApiFetch<PaginationResponse<Badge>>({ method: 'GET', endpoint: `${BADGES_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    createUserBadge: async (data: { flag: string }) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${USERS_ENDPOINT}/${ME_ENDPOINT}/${BADGES_ENDPOINT}/`,
        data,
        token: await getAccessTokenSilently(),
      }),

    getBadgeLeaderboard: async (badgeId: Badge['id'], filters?: any) =>
      ApiFetch<PaginationResponse<BadgeLeaderboard>>({
        method: 'GET',
        endpoint: `${BADGES_ENDPOINT}/${badgeId}/${BADGES_LEADERBOARD_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getOverallBadgesLeaderboard: async (filters?: any) =>
      ApiFetch<PaginationResponse<BadgesOverallLeaderboard>>({
        method: 'GET',
        endpoint: `${BADGES_ENDPOINT}/${BADGES_LEADERBOARD_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getBadgeCategories: async (filters?: any) =>
      ApiFetch<PaginationResponse<BadgeCategory>>({
        method: 'GET',
        endpoint: `${BADGES_ENDPOINT}/${BADGE_CATEGORIES_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getBadgeCategory: async (badgeCategoryId: BadgeCategory['id']) =>
      ApiFetch<BadgeCategory>({
        method: 'GET',
        endpoint: `${BADGES_ENDPOINT}/${BADGE_CATEGORIES_ENDPOINT}/${badgeCategoryId}/`,
        token: await getAccessTokenSilently(),
      }),

    //
    // Gallery
    //
    getGallery: async (id: Gallery['id']) =>
      ApiFetch<Gallery>({ method: 'GET', endpoint: `${GALLERY_ENDPOINT}/${id}/`, token: await getAccessTokenSilently() }),

    getGalleries: async (filters?: any) =>
      ApiFetch<PaginationResponse<Gallery>>({ method: 'GET', endpoint: `${GALLERY_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    createGallery: async (item: GalleryCreate) =>
      ApiFetch<Gallery>({ method: 'POST', endpoint: `${GALLERY_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    updateGallery: async (id: Gallery['id'], item: Partial<Gallery>) =>
      ApiFetch<Gallery>({ method: 'PUT', endpoint: `${GALLERY_ENDPOINT}/${id}/`, data: item, token: await getAccessTokenSilently() }),

    deleteGallery: async (id: Gallery['id']) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${GALLERY_ENDPOINT}/${id}/`, token: await getAccessTokenSilently() }),

    getGalleryPictures: async (galleryId: Gallery['id'], filters?: any) =>
      ApiFetch<PaginationResponse<Picture>>({
        method: 'GET',
        endpoint: `${GALLERY_ENDPOINT}/${galleryId}/${PICTURE_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    getPicture: async (galleryId: Gallery['id'], pictureId: Picture['id']) =>
      ApiFetch<Picture>({
        method: 'GET',
        endpoint: `${GALLERY_ENDPOINT}/${galleryId}/${PICTURE_ENDPOINT}/${pictureId}`,
        token: await getAccessTokenSilently(),
      }),

    createPicture: async (galleryId: Gallery['id'], files: File | File[] | Blob) =>
      ApiFetch<RequestResponse>({
        method: 'POST',
        endpoint: `${GALLERY_ENDPOINT}/${galleryId}/${PICTURE_ENDPOINT}/`,
        files: files,
        token: await getAccessTokenSilently(),
      }),

    updatePicture: async (galleryId: Gallery['id'], pictureId: Picture['id'], item: Partial<Picture>) =>
      ApiFetch<Picture>({
        method: 'PUT',
        endpoint: `${GALLERY_ENDPOINT}/${galleryId}/${PICTURE_ENDPOINT}/${pictureId}/`,
        data: item,
        token: await getAccessTokenSilently(),
      }),

    deletePicture: async (galleryId: Gallery['id'], pictureId: Picture['id']) =>
      ApiFetch<RequestResponse>({
        method: 'DELETE',
        endpoint: `${GALLERY_ENDPOINT}/${galleryId}/${PICTURE_ENDPOINT}/${pictureId}`,
        token: await getAccessTokenSilently(),
      }),

    //
    // Töddel
    //
    getToddels: async (filters?: any) =>
      ApiFetch<PaginationResponse<Toddel>>({ method: 'GET', endpoint: `${TODDEL_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),
    createToddel: async (data: ToddelMutate) =>
      ApiFetch<Toddel>({ method: 'POST', endpoint: `${TODDEL_ENDPOINT}/`, data, token: await getAccessTokenSilently() }),
    updateToddel: async (edition: Toddel['edition'], data: ToddelMutate) =>
      ApiFetch<Toddel>({ method: 'PUT', endpoint: `${TODDEL_ENDPOINT}/${edition}/`, data, token: await getAccessTokenSilently() }),
    deleteToddel: async (edition: Toddel['edition']) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${TODDEL_ENDPOINT}/${edition}/`, token: await getAccessTokenSilently() }),

    //
    // Notifications
    //
    getNotifications: async (filters?: any) =>
      ApiFetch<PaginationResponse<Notification>>({
        method: 'GET',
        endpoint: `${NOTIFICATIONS_ENDPOINT}/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      }),

    updateNotification: async (id: number, item: { read: boolean }) =>
      ApiFetch<Notification>({ method: 'PUT', endpoint: `${NOTIFICATIONS_ENDPOINT}/${String(id)}/`, data: item, token: await getAccessTokenSilently() }),

    //
    // Short links
    //
    getShortLinks: async (filters?: any) =>
      ApiFetch<Array<ShortLink>>({ method: 'GET', endpoint: `${SHORT_LINKS_ENDPOINT}/`, data: filters || {}, token: await getAccessTokenSilently() }),

    createShortLink: async (item: ShortLink) =>
      ApiFetch<ShortLink>({ method: 'POST', endpoint: `${SHORT_LINKS_ENDPOINT}/`, data: item, token: await getAccessTokenSilently() }),

    deleteShortLink: async (slug: string) =>
      ApiFetch<RequestResponse>({ method: 'DELETE', endpoint: `${SHORT_LINKS_ENDPOINT}/${slug}/`, token: await getAccessTokenSilently() }),

    //
    // Misc
    //
    getWarnings: async () => ApiFetch<Array<Warning>>({ method: 'GET', endpoint: `${WARNINGS_ENDPOINT}/`, token: await getAccessTokenSilently() }),

    getCheatsheets: async (study: CheatsheetStudy, grade: number, filters?: any) => {
      const tempStudy = study === CheatsheetStudy.DIGSEC ? 'DIGINC' : study;
      return ApiFetch<PaginationResponse<Cheatsheet>>({
        method: 'GET',
        endpoint: `${CHEATSHEETS_ENDPOINT}/${tempStudy.toUpperCase()}/${String(grade)}/files/`,
        data: filters || {},
        token: await getAccessTokenSilently(),
      });
    },

    uploadFile: async (file: File | Blob) =>
      ApiFetch<FileUploadResponse>({ method: 'POST', endpoint: 'upload/', files: file, token: await getAccessTokenSilently() }),

    emailForm: (data: CompaniesEmail) => ApiFetch<RequestResponse>({ method: 'POST', endpoint: `accept-form/`, data }),
  };
};
