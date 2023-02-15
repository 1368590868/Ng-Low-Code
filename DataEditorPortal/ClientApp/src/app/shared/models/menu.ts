import { MenuItem } from 'primeng/api';

export interface SiteMenu extends MenuItem {
  name: string;
  link?: string;
  type?: string;
  status?: string;
  description?: string;
  items?: SiteMenu[];
}
