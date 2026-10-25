/**
 * Omnidite OS internal command center.
 * This derivative keeps the upstream Ever Gauzy AGPL-3.0 license intact.
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@gauzy/ui-core/core';

interface LaunchModule {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly group: string;
}
interface WorkspaceLink {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly category: string;
}

@Component({
  selector: 'omnidite-os',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './omnidite-os.component.html',
  styleUrls: ['./omnidite-os.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OmniditeOsComponent {
  private readonly store = inject(Store);
  public readonly organization$ = this.store.selectedOrganization$;
  public searchQuery = '';
  /**
   * These are actual Gauzy module routes, not replacements for Gauzy data.
   * Existing route guards, permissions, and feature flags remain authoritative.
   */
  public readonly modules: readonly LaunchModule[] = [
    { id: 'crm', icon: 'CR', title: 'Clients & contacts', description: 'Manage relationships, customers and partners', route: '/pages/contacts', group: 'CRM' },
    { id: 'sales', icon: 'BD', title: 'Sales pipeline', description: 'Track opportunities and deal progression', route: '/pages/sales/pipelines', group: 'Sales' },
    { id: 'projects', icon: 'PM', title: 'Projects', description: 'Coordinate client and internal initiatives', route: '/pages/organization/projects', group: 'Delivery' },
    { id: 'tasks', icon: 'TK', title: 'Tasks', description: 'Organize assignments and daily priorities', route: '/pages/tasks', group: 'Delivery' },
    { id: 'invoices', icon: 'IN', title: 'Invoices', description: 'Manage invoicing and receivables', route: '/pages/accounting/invoices', group: 'Finance' },
    { id: 'expenses', icon: 'EX', title: 'Expenses', description: 'Review operating and project costs', route: '/pages/accounting/expenses', group: 'Finance' },
    { id: 'vendors', icon: 'VN', title: 'Vendors & sourcing', description: 'Keep supplier and vendor relationships organized', route: '/pages/organization/vendors', group: 'Supply chain' },
    { id: 'reports', icon: 'RP', title: 'Business reporting', description: 'Explore Gauzy business performance dashboards', route: '/pages/dashboard/accounting', group: 'Insights' }
  ];

  /** Links only. Does not connect to the underlying apps or read their data. */
  public readonly workspaces: readonly WorkspaceLink[] = [
    { id: 'omnidite', name: 'Omnidite Advisory', description: 'Company website and enquiries', url: 'https://omnidite.com', category: 'Company' },
    { id: 'sgbuddy', name: 'SGBuddy', description: 'Singapore companion application', url: 'https://sgbuddy.omnidite.com', category: 'Application' },
    { id: 'atlas', name: 'Aedificatus Atlas', description: 'Additive manufacturing intelligence', url: 'https://atlas.aedificatus.com', category: 'Application' },
    { id: 'providence', name: 'Providence', description: 'Situational intelligence workspace', url: 'https://providence.omnidite.com', category: 'Application' },
    { id: 'darts', name: 'Space City Darts', description: 'Community and organization website', url: 'https://spacecitydarts.org', category: 'Organization' }
  ];

  public get filteredWorkspaces(): readonly WorkspaceLink[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.workspaces;
    return this.workspaces.filter((item) =>
      [item.name, item.description, item.category].some((field) => field.toLowerCase().includes(query))
    );
  }

  public filterWorkspaces(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
}
