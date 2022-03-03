import { format, getYear, isAfter, isBefore, parseISO, subMinutes } from 'date-fns';
import nbLocale from 'date-fns/locale/nb';
import slugify from 'slugify';

import { Event, GroupLaw, SelectFormField, SelectFormFieldOption, TextFormField } from 'types';
import { FormFieldType, JobPostType, MembershipType, StrikeReason, UserClass, UserStudy } from 'types/Enums';

export const isAfterDateOfYear = (month: number, date: number) => isAfter(new Date(), new Date(getYear(new Date()), month, date, 0, 0, 0));
export const isBeforeDateOfYear = (month: number, date: number) => isBefore(new Date(), new Date(getYear(new Date()), month, date, 0, 0, 0));

/**
 * Slugify a string to make it safe to use in an URL
 * @param text The string the slugify
 */
export const urlEncode = (text = '') => slugify(text, { lower: true, strict: true, locale: 'nb' });

/**
 * Test if an URL points to an external website or an internal page
 *
 * *Examples:*
 * - https://www.tihlde.org -> `true`
 * - /arrangementer/8/ -> `false`
 * @param url The URL to check
 */
export const isExternalURL = (url = '') => url.indexOf(':') > -1 || url.indexOf('//') > -1;

/**
 * Short down string if longer than limit
 * @param string String to shorten
 * @param maxStringLength Max length of returned string
 */
export const shortDownString = (string: string, maxStringLength: number) => {
  if (string.length > maxStringLength) {
    string = string.slice(0, maxStringLength) + '...';
  }
  return string;
};

/**
 * Find how many hours a users start of registration to an event is delayed because of their strikes.
 * @param numberOfStrikes The number of strikes the user have
 */
export const getStrikesDelayedRegistrationHours = (numberOfStrikes: number) => {
  if (numberOfStrikes === 0) {
    return 0;
  } else if (numberOfStrikes === 1) {
    return 3;
  }
  return 12;
};

/**
 * Get user study in shortened version
 * @param userStudy User study
 */
export const getUserStudyShort = (userStudy: UserStudy) => {
  switch (userStudy) {
    case UserStudy.DATAING:
      return 'Dataing';
    case UserStudy.DIGFOR:
      return 'DigFor';
    case UserStudy.DIGSEC:
      return 'DigSec';
    case UserStudy.DIGSAM:
      return 'DigSam';
    case UserStudy.DRIFT:
      return 'Drift';
    case UserStudy.INFO:
      return 'Info';
    default:
      return 'Ukjent studie';
  }
};

/**
 * Get user study in long version
 * @param userStudy User study
 */
export const getUserStudyLong = (userStudy: UserStudy) => {
  switch (userStudy) {
    case UserStudy.DATAING:
      return 'Dataingeniør';
    case UserStudy.DIGFOR:
      return 'Digital forretningsutvikling';
    case UserStudy.DIGSEC:
      return 'Digital infrastruktur og cybersikkerhet';
    case UserStudy.DIGSAM:
      return 'Digital samhandling';
    case UserStudy.DRIFT:
      return 'Drift av datasystemer';
    case UserStudy.INFO:
      return 'Informasjonsbehandling';
    default:
      return 'Ukjent studie';
  }
};

/**
 * Get user class as text
 * @param userClass User class
 */
export const getUserClass = (userClass: UserClass) => {
  switch (userClass) {
    case UserClass.ALUMNI:
      return 'Alumni';
    case UserClass.FIRST:
      return '1. klasse';
    case UserClass.SECOND:
      return '2. klasse';
    case UserClass.THIRD:
      return '3. klasse';
    case UserClass.FOURTH:
      return '4. klasse';
    case UserClass.FIFTH:
      return '5. klasse';
    default:
      return 'Ukjent klasse';
  }
};

export const USER_CLASSES = [UserClass.FIRST, UserClass.SECOND, UserClass.THIRD, UserClass.FOURTH, UserClass.FIFTH, UserClass.ALUMNI];
export const USER_STUDIES = [UserStudy.DATAING, UserStudy.DIGFOR, UserStudy.DIGSEC, UserStudy.DIGSAM, UserStudy.DRIFT, UserStudy.INFO];

/**
 * Get jobpost type as text
 * @param jobpostType JobPost type
 */
export const getJobpostType = (jobpostType: JobPostType) => {
  switch (jobpostType) {
    case JobPostType.PART_TIME:
      return 'Deltid';
    case JobPostType.FULL_TIME:
      return 'Fulltid';
    case JobPostType.SUMMER_JOB:
      return 'Sommerjobb';
    case JobPostType.OTHER:
      return 'Annet';
    default:
      return 'Ukjent jobbtype';
  }
};

/**
 * Get membership type as text
 * @param membershipType Membership type
 */
export const getMembershipType = (membershipType: MembershipType) => {
  switch (membershipType) {
    case MembershipType.LEADER:
      return 'Leder';
    case MembershipType.MEMBER:
      return 'Medlem';
    default:
      return 'Ukjent medlemskapstype';
  }
};

/**
 * Get strike reason as readable text
 * @param strikeReason Strike reason enum
 */
export const getStrikeReasonAsText = (strikeReason: StrikeReason) => {
  switch (strikeReason) {
    case StrikeReason.BAD_BEHAVIOR:
      return 'Upassende oppførsel (1 prikk)';
    case StrikeReason.EVAL_FORM:
      return 'Ikke svart på evalueringsskjema (3 prikk)';
    case StrikeReason.LATE:
      return 'Møtte for sent (1 prikk)';
    case StrikeReason.NO_SHOW:
      return 'Møtte ikke (2 prikk)';
    case StrikeReason.PAST_DEADLINE:
      return 'Meldt av etter avmeldingsfrist (1 prikk)';
    default:
      return 'Ukjent grunn til prikk';
  }
};

/**
 * Format date in format: `Tor 12. okt. 2021 08:30`
 * Year is only shown if it's a different year than this year
 * @param date Date to be formatted
 * @param options Configure what info the formatted date should contain
 */
export const formatDate = (
  date: Date,
  {
    time = true,
    fullMonth = false,
    fullDayOfWeek = false,
    capitalizeFirstLetter = true,
  }: { time?: boolean; fullMonth?: boolean; fullDayOfWeek?: boolean; capitalizeFirstLetter?: boolean } = {},
) => {
  const isDifferentYear = date.getFullYear() !== new Date().getFullYear();
  const formatDateString = `${fullDayOfWeek ? 'EEEE' : 'E'} do ${fullMonth ? 'MMMM' : 'MMM'}${isDifferentYear ? ' yyyy' : ''}`;
  const formatted = format(date, `${formatDateString}${time ? ' p' : ''}`, { locale: nbLocale });
  return capitalizeFirstLetter ? `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}` : formatted;
};

/**
 * Get time since a date, format: `x sekunder/minutter/timer/dager siden`
 * Returns `formatDate(date)` if more than 7 days ago
 * @param date Date to get time since
 */
export const getTimeSince = (date: Date) => {
  const ms = new Date().getTime() - date.getTime();
  const sec = Number((ms / 1000).toFixed(0));
  const min = Number((ms / (1000 * 60)).toFixed(0));
  const hrs = Number((ms / (1000 * 60 * 60)).toFixed(0));
  const days = Number((ms / (1000 * 60 * 60 * 24)).toFixed(0));
  if (sec < 60) {
    return `${sec} sekunder siden`;
  } else if (min < 60) {
    return `${min} minutter siden`;
  } else if (hrs < 24) {
    return `${hrs} timer siden`;
  } else if (days < 7) {
    return `${days} dager siden`;
  } else {
    return formatDate(date);
  }
};

/**
 * Transforms a date to when UTC+0 will be at the same time.
 * Ex.: 15:00 in UTC+2 is transformed to 17:00 as UTC+0 at that time will be 15:00
 * @param date - The date to transform
 * @returns A new date
 */
export const dateAsUTC = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()));
};

/**
 * Transforms a date to UTC+0.
 * Ex.: 15:00 in UTC+2 is transformed to 13:00 as thats the equivalent time in UTC+0
 * @param date - The date to transform
 * @returns A new date
 */
export const dateToUTC = (date: Date): Date => {
  return subMinutes(date, -date.getTimezoneOffset());
};

/**
 * Formats a law header
 * @param law the law
 * @returns String with format: `§1.23 - Title`
 */
export const formatLawHeader = (law: GroupLaw): string => `§${law.paragraph % 1 === 0 ? ~~law.paragraph : law.paragraph} - ${law.title}`;

/**
 * Create a ICS-file from an event
 * @param event - The event
 * @returns A ICS-string
 */
export const getICSFromEvent = (event: Event): string => {
  const formating = `yyyyMMdd'T'HHmmss'Z'`;
  const start = format(dateToUTC(parseISO(event.start_date)), formating);
  const end = format(dateToUTC(parseISO(event.end_date)), formating);

  const calendarChunks = [
    { key: 'BEGIN', value: 'VCALENDAR' },
    { key: 'VERSION', value: '2.0' },
    { key: 'BEGIN', value: 'VEVENT' },
    { key: 'URL', value: `https://s.tihlde.org/a/${event.id}/` },
    { key: 'DTSTART', value: start },
    { key: 'DTEND', value: end },
    { key: 'SUMMARY', value: event.title },
    { key: 'DESCRIPTION', value: `Se arrangementet på: https://s.tihlde.org/a/${event.id}/` },
    { key: 'LOCATION', value: event.location },
    { key: 'END', value: 'VEVENT' },
    { key: 'END', value: 'VCALENDAR' },
  ];

  const calendarUrl = calendarChunks
    .filter((chunk) => chunk.value)
    .map((chunk) => `${chunk.key}:${encodeURIComponent(`${chunk.value}\n`)}`)
    .join('');
  return `data:text/calendar;charset=utf8,${calendarUrl}`;
};

/**
 * Converts a JSON-object into args which can be transfered in an URL
 * @param data A JSON-object
 * @returns String with format: `?key1=value1&key2=value2`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const argsToParams = (data: Record<string, any>) => {
  let args = '?';
  for (const key in data) {
    if (Array.isArray(data[key])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const value in data[key] as any) {
        args += `&${key}=${data[key][value]}`;
      }
    } else if (!(data[key] === undefined || (typeof data[key] === 'string' && data[key].trim().length === 0))) {
      args += `&${key}=${data[key]}`;
    }
  }
  return args;
};

/**
 * Removes id's from fields and the options of the given fields
 *
 * @param fields The fields to remove the id's from
 */
export const removeIdsFromFields = (fields: Array<TextFormField | SelectFormField>) => {
  const newFields: Array<TextFormField | SelectFormField> = [];
  fields.forEach((field) => {
    const { id, ...restField } = field; // eslint-disable-line
    const newOptions: Array<SelectFormFieldOption> = [];
    if (field.type !== FormFieldType.TEXT_ANSWER) {
      field.options.forEach((option) => {
        const { id, ...restOption } = option; // eslint-disable-line
        newOptions.push(restOption as SelectFormFieldOption);
      });
    }
    newFields.push({ ...restField, options: newOptions } as TextFormField | SelectFormField);
  });
  return newFields;
};
