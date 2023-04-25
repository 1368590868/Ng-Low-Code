export interface EditFormField {
  key: string;
  type: string;
  props: { [name: string]: string };
}

export interface EditFormData {
  [name: string]: any;
}

export interface FormEventMeta {
  eventType?: string;
  script?: string;
}
export interface FormEventConfig {
  afterSaved?: FormEventMeta;
  onValidate?: FormEventMeta;
}
