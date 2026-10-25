/**
 * Omnidite OS internal command center.
 * This derivative keeps the upstream Ever Gauzy AGPL-3.0 license intact.
 */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { IGetTaskOptions, IOrganization, IOrganizationContactFindInput, IOrganizationProjectsFindInput } from '@gauzy/contracts';
import { RouterLink } from '@angular/router';
import { OrganizationContactService, OrganizationProjectsService, Store, TasksService } from '@gauzy/ui-core/core';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectsService = inject(OrganizationProjectsService);
  private readonly contactsService = inject(OrganizationContactService);
  private readonly tasksService = inject(TasksService);
  private metricsGeneration = 0;

  public readonly loadingMetrics = signal(false);
  public readonly projectsPreview = signal<readonly { id: string; name: string }[]>([]);
  public readonly projectsPreviewState = signal<'unavailable' | 'empty' | 'ready'>('empty');
  public readonly metrics = signal<readonly { id: string; label: string; value: string; description: string }[]>([
    { id: 'projects', label: 'Projects', value: '—', description: 'Current organization' },
    { id: 'contacts', label: 'Contacts', value: '—', description: 'Current organization' },
    { id: 'tasks', label: 'Tasks', value: '—', description: 'Current organization' }
  ]);
  public searchQuery = '';

  constructor() {
    this.organization$
      .pipe(
        distinctUntilChanged((previous, current) =>
          previous?.id === current?.id && previous?.tenantId === current?.tenantId
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((organization) => {
        if (organization) {
          void this.loadMetrics(organization);
        } else {
          // Reset immediately when an organization is deselected.
          ++this.metricsGeneration;
          this.projectsPreview.set([]);
          this.projectsPreviewState.set('empty');
          this.loadingMetrics.set(false);
          this.metrics.update((current) => current.map((metric) => ({
            ...metric, value: '—', description: 'Select an organization'
          })));
        }
      });
  }

  public refreshMetrics(): void {
    const organization = this.store.selectedOrganization;
    if (organization) void this.loadMetrics(organization);
  }

  /** Reuses Gauzy services so JWT, organization scoping and API handling stay centralized. */
  private async loadMetrics(organization: IOrganization): Promise<void> {
    const request = ++this.metricsGeneration;
    this.loadingMetrics.set(true);

    const scope = { organizationId: organization.id, tenantId: organization.tenantId };
    const [projects, contacts, tasks] = await Promise.allSettled([
      this.projectsService.getAll([], scope as IOrganizationProjectsFindInput),
      this.contactsService.getAll([], scope as IOrganizationContactFindInput),
      firstValueFrom(this.tasksService.getAllTasks(scope as IGetTaskOptions))
    ]);

    // A response for an organization we left must never paint the new organization.
    if (request !== this.metricsGeneration || this.store.selectedOrganization?.id !== organization.id) return;

    this.projectsPreview.set(
      projects.status === 'fulfilled'
        ? projects.value.items.slice(0, 5).map((project) => ({ id: project.id, name: project.name }))
        : []
    );
    this.projectsPreviewState.set(
      projects.status !== 'fulfilled'
        ? 'unavailable'
        : projects.value.items.length === 0 ? 'empty' : 'ready'
    );

    const display = (outcome: PromiseSettledResult<unknown>, count: number | undefined): string =>
      outcome.status === 'fulfilled' && typeof count === 'number' && Number.isFinite(count)
        ? String(Math.max(0, count))
        : '—';

    this.metrics.set([
      {
        id: 'projects', label: 'Projects',
        value: display(projects, projects.status === 'fulfilled' ? projects.value.total : undefined),
        description: projects.status === 'fulfilled' ? 'Current organization' : 'Not available to this account'
      },
      {
        id: 'contacts', label: 'Contacts',
        value: display(contacts, contacts.status === 'fulfilled' ? contacts.value.total : undefined),
        description: contacts.status === 'fulfilled' ? 'Current organization' : 'Not available to this account'
      },
      {
        id: 'tasks', label: 'Tasks',
        value: display(tasks, tasks.status === 'fulfilled' ? tasks.value.total : undefined),
        description: tasks.status === 'fulfilled' ? 'Current organization' : 'Not available to this account'
      }
    ]);
    this.loadingMetrics.set(false);
  }

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
