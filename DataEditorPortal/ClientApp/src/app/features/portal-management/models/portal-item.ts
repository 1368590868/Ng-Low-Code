export interface PortalItem {
  data?: PortalItemData;
  children?: PortalItem[];
}

export interface PortalItemData {
  [name: string]: any;
}
