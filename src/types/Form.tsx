import { EventFormType, FormFieldType, FormResourceType } from 'types/Enums';
import { EventCompact } from 'types/Event';
import { Group } from 'types/Group';
import { UserBase } from 'types/User';

// -----------------------------------------------------------
// Interfaces used for the creating of forms and viewing forms
// -----------------------------------------------------------

export interface FormBase {
  id: string;
  title: string;
  fields: Array<TextFormField | SelectFormField>;
  viewer_has_answered: boolean;
  template: boolean;
}

export interface EventForm extends FormBase {
  type: EventFormType;
  event: EventCompact;
  resource_type: FormResourceType.EVENT_FORM;
}

export interface GroupForm extends FormBase {
  group: Group;
  resource_type: FormResourceType.GROUP_FORM;
  can_submit_multiple: boolean;
  only_for_group_members: boolean;
  is_open_for_submissions: boolean;
  email_receiver_on_submit: string | null;
}

export interface TemplateForm extends FormBase {
  resource_type: FormResourceType.FORM;
}

export type Form = EventForm | GroupForm | TemplateForm;

export type EventFormCreate = Partial<Omit<EventForm, 'event'>> &
  Pick<EventForm, 'resource_type' | 'type' | 'title' | 'fields'> & {
    event: EventForm['event']['id'];
  };

export type GroupFormCreate = Partial<Omit<GroupForm, 'group'>> &
  Pick<GroupForm, 'resource_type' | 'title' | 'fields'> & {
    group: GroupForm['group']['slug'];
  };

export type TemplateFormCreate = Omit<TemplateForm, 'id'>;

export type EventFormUpdate = Partial<EventFormCreate> & Pick<EventForm, 'resource_type'>;
export type GroupFormUpdate = Partial<GroupFormCreate> & Pick<GroupForm, 'resource_type'>;
export type TemplateFormUpdate = Partial<TemplateFormCreate> & Pick<TemplateFormCreate, 'resource_type'>;

export type FormCreate = EventFormCreate | GroupFormCreate | TemplateFormCreate;
export type FormUpdate = EventFormUpdate | GroupFormUpdate | TemplateFormUpdate;

interface FormField {
  id?: string;
  title: string;
  required: boolean;
}

export interface TextFormField extends FormField {
  options: Array<unknown>;
  type: FormFieldType.TEXT_ANSWER;
}

export interface SelectFormField extends FormField {
  options: Array<SelectFormFieldOption>;
  type: FormFieldType.MULTIPLE_SELECT | FormFieldType.SINGLE_SELECT;
}

export interface SelectFormFieldOption {
  id?: string;
  title: string;
}

export interface FormStatistics extends FormBase {
  statistics: Array<SelectFormFieldStatistics>;
}

export interface SelectFormFieldStatistics extends SelectFormField {
  options: Array<SelectFormFieldOptionStatistics>;
}

export interface SelectFormFieldOptionStatistics extends SelectFormFieldOption {
  answer_amount: number;
  answer_percentage: number;
}

// ------------------------------------
// Interfaces used when answering forms
// ------------------------------------

export interface Submission {
  answers: Array<TextFieldSubmission | SelectFieldSubmission>;
}

interface FieldSubmission {
  field: {
    id: string;
  };
}

export interface TextFieldSubmission extends FieldSubmission {
  answer_text: string;
}

export interface SelectFieldSubmission extends FieldSubmission {
  selected_options: Array<{ id: string }>;
}

export interface UserSubmission {
  user: UserBase;
  form: string;
  answers: Array<TextFieldSubmission | SelectFieldSubmission>;
}
