export interface PortalItem {
  data?: PortalItemData;
  children?: PortalItem[];
  expanded?: boolean;
}

export interface PortalItemData {
  [name: string]: any;
}
