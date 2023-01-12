export interface EditFormField {
  key: string;
  type: string;
  props: { [name: string]: string };
  dependOnFields?: string;
}

export interface EditFormData {
  [name: string]: any;
}
