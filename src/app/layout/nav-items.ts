export interface NavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'nav.lists', icon: 'pi pi-list-check', route: '/lists' },
  { label: 'nav.templates', icon: 'pi pi-clone', route: '/templates' },
  { label: 'nav.insights', icon: 'pi pi-chart-line', route: '/insights' },
];
