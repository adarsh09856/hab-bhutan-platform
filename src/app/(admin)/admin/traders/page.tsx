import { redirect } from 'next/navigation';

/**
 * Trader management is hidden for now. Public directory searches use Outlets,
 * so route staff to the existing outlet and artisan-cluster manager instead.
 * Trader APIs and saved records remain available for a future re-enable.
 */
export default function AdminTradersPage(): never {
  redirect('/admin/clusters-outlets');
}
