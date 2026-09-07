export type Permission =
  | '*'
  | 'AUDIT_VIEW'
  | 'ROLES_MANAGE'
  | 'FX_OVERRIDE'
  | 'MEMBERS_VIEW'
  | 'MEMBERS_EDIT'
  | 'APPLICATIONS_REVIEW'
  | 'PORTAL_ACCESS'
  | 'PRODUCTS_SUBMIT'
  | 'DUES_PAY'
  // Applications
  | 'applications:view'
  | 'applications:create'
  | 'applications:review'
  | 'applications:approve'
  | 'applications:reject'
  | 'applications:edit'
  | 'applications:delete'
  // Members
  | 'members:view'
  | 'members:create'
  | 'members:edit'
  | 'members:verify'
  | 'members:suspend'
  | 'members:archive'
  | 'members:delete'
  // Products
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:review'
  | 'products:publish'
  | 'products:archive'
  | 'products:delete'
  // Orders
  | 'orders:view'
  | 'orders:create'
  | 'orders:edit'
  | 'orders:fulfill'
  | 'orders:cancel'
  | 'orders:refund'
  // Content & CMS
  | 'content:view'
  | 'content:create'
  | 'content:edit'
  | 'content:delete'
  | 'governance:view'
  | 'governance:create'
  | 'governance:edit'
  | 'governance:delete'
  // Finance & Projects
  | 'dues:view'
  | 'dues:record'
  | 'reports:view'
  | 'reports:export'
  | 'projects:view'
  | 'projects:create'
  | 'projects:edit'
  | 'projects:delete'
  // System Administration & Security
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'roles:view'
  | 'roles:create'
  | 'roles:retire'
  | 'roles:reassign'
  | 'fx:override'
  | 'audit:view';

export interface PermissionCategory {
  name: string;
  permissions: { slug: Permission; label: string; description: string }[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: 'Applications Management',
    permissions: [
      { slug: 'applications:view', label: 'View Applications', description: 'Browse and inspect incoming artisan applications' },
      { slug: 'applications:create', label: 'Create/Log Application', description: 'Log manual paper applications received offline' },
      { slug: 'applications:review', label: 'Review Applications', description: 'Assign reviewers and record review notes' },
      { slug: 'applications:approve', label: 'Approve Application', description: 'Approve applicant and automatically provision Member' },
      { slug: 'applications:reject', label: 'Reject Application', description: 'Reject application with required formal reason' },
      { slug: 'applications:edit', label: 'Edit Application Data', description: 'Correct applicant details, CID, village or tier' },
      { slug: 'applications:delete', label: 'Delete Application', description: 'Permanently purge unreviewed application drafts' },
    ],
  },
  {
    name: 'Artisan Members Directory',
    permissions: [
      { slug: 'members:view', label: 'View Members', description: 'Access member profiles, contact info, and status' },
      { slug: 'members:create', label: 'Register Member', description: 'Directly register a new artisan or guild entity' },
      { slug: 'members:edit', label: 'Edit Member Profile', description: 'Update bio, craft category, dzongkhag, dues expiry' },
      { slug: 'members:verify', label: 'Verify Member', description: 'Confirm credentials and grant active verified status' },
      { slug: 'members:suspend', label: 'Suspend Member', description: 'Temporarily revoke verified membership privileges' },
      { slug: 'members:archive', label: 'Archive Member', description: 'Retire member record to archival storage' },
      { slug: 'members:delete', label: 'Delete Member', description: 'Permanently remove member if zero orders/products exist' },
    ],
  },
  {
    name: 'Catalog Products',
    permissions: [
      { slug: 'products:view', label: 'View Catalog', description: 'Browse all active, draft, and archived items' },
      { slug: 'products:create', label: 'Create Product', description: 'Add new artisan handcrafted craft listing' },
      { slug: 'products:edit', label: 'Edit Product', description: 'Update price, stock, images, maker, and description' },
      { slug: 'products:review', label: 'Review Product', description: 'Audit craft authenticity and compliance standards' },
      { slug: 'products:publish', label: 'Publish Product', description: 'Make craft listing publicly purchasable' },
      { slug: 'products:archive', label: 'Archive Product', description: 'Delist craft without breaking order references' },
      { slug: 'products:delete', label: 'Delete Product', description: 'Permanently delete item with 0 historical order references' },
    ],
  },
  {
    name: 'Order Fulfillment & Sales',
    permissions: [
      { slug: 'orders:view', label: 'View Orders', description: 'Inspect order queue, addresses, and line-items' },
      { slug: 'orders:create', label: 'Create Manual Order', description: 'Record telephone/in-person craft purchases' },
      { slug: 'orders:edit', label: 'Edit Order', description: 'Update shipping tracking number or customer notes' },
      { slug: 'orders:fulfill', label: 'Fulfill & Dispatch', description: 'Transition order to SHIPPED / DELIVERED status' },
      { slug: 'orders:cancel', label: 'Cancel Order', description: 'Cancel order and atomically return stock to catalog' },
      { slug: 'orders:refund', label: 'Refund Order', description: 'Mark payment refunded and adjust accounting state' },
    ],
  },
  {
    name: 'Content & CMS',
    permissions: [
      { slug: 'content:view', label: 'View CMS Content', description: 'Read draft and published articles and publications' },
      { slug: 'content:create', label: 'Create Articles & Reports', description: 'Author new news releases and upload publications' },
      { slug: 'content:edit', label: 'Edit Content', description: 'Modify titles, blurbs, files, and publish state' },
      { slug: 'content:delete', label: 'Delete Content', description: 'Remove outdated publications or news articles' },
      { slug: 'governance:view', label: 'View Governance', description: 'Inspect Board of Trustees & Chapter rosters' },
      { slug: 'governance:create', label: 'Add Governance Official', description: 'Add official to secretariat or chapter leadership' },
      { slug: 'governance:edit', label: 'Edit Governance Official', description: 'Update official title, chapter note, or sort index' },
      { slug: 'governance:delete', label: 'Delete Governance Official', description: 'Remove official from governance directory' },
    ],
  },
  {
    name: 'Financial Reports & Donor Projects',
    permissions: [
      { slug: 'reports:view', label: 'View Financial Reports', description: 'Inspect revenue, dues, and craft sales metrics' },
      { slug: 'reports:export', label: 'Export Reports', description: 'Download CSV / accounting ledger datasets' },
      { slug: 'projects:view', label: 'View Donor Projects', description: 'Review donor grant projects and progress' },
      { slug: 'projects:create', label: 'Create Project', description: 'Register new donor-funded or bilateral project' },
      { slug: 'projects:edit', label: 'Edit Project', description: 'Update budget, activities, results, and progress %' },
      { slug: 'projects:delete', label: 'Delete Project', description: 'Remove obsolete or draft project records' },
      { slug: 'dues:view', label: 'View Dues', description: 'Inspect member annual renewal fee records' },
      { slug: 'dues:record', label: 'Record Dues', description: 'Log verified dues payment and advance expiry date' },
    ],
  },
  {
    name: 'System Administration & Security',
    permissions: [
      { slug: 'users:view', label: 'View Staff Users', description: 'List administrative operator accounts and roles' },
      { slug: 'users:create', label: 'Create Staff User', description: 'Provision new back-office operator account' },
      { slug: 'users:edit', label: 'Edit Staff User', description: 'Change name, assigned role, or contact email' },
      { slug: 'users:delete', label: 'Deactivate Staff User', description: 'Soft-deactivate staff account access' },
      { slug: 'roles:view', label: 'View Roles & RBAC', description: 'Inspect permission matrices and role revisions' },
      { slug: 'roles:create', label: 'Create Role Revision', description: 'Publish new immutable role specification' },
      { slug: 'roles:retire', label: 'Retire Role', description: 'Deprecate superseded role versions safely' },
      { slug: 'roles:reassign', label: 'Reassign Role Users', description: 'Migrate users across role revisions' },
      { slug: 'fx:override', label: 'Override Exchange Rates', description: 'Manually set or clear RMA BTN/USD valuation' },
      { slug: 'audit:view', label: 'View Audit Logs', description: 'Inspect immutable cryptographic action trail' },
    ],
  },
];
