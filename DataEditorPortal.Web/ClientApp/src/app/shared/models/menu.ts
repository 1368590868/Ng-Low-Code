import { MenuItem } from 'primeng/api';

export interface SiteMenu extends MenuItem {
  name: string;
  link?: string;
  type?: string;
  itemType?: string;
  status?: number;
  description?: string;
  items?: SiteMenu[];
}
