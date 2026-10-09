import prisma from '@/lib/prisma';
import { sendEmail, type SendEmailOptions } from '@/lib/email-service';

export type SubmissionKind = 'membership' | 'wholesale' | 'quote' | 'contact' | 'donation';
const submissions: Record<SubmissionKind, { title: string; next: string; adminPath: string }> = {
  membership: { title: 'Membership application received', next: 'HAB will review your application and payment evidence. Membership is pending approval.', adminPath: '/admin/applications' },
  wholesale: { title: 'Wholesale registration received', next: 'HAB will review your registration and payment evidence. Wholesale access is pending approval.', adminPath: '/admin/wholesale' },
  quote: { title: 'Wholesale quote request received', next: 'The trade desk will review availability, prices and delivery before confirming an order. No payment has been confirmed.', adminPath: '/admin/inquiries' },
  contact: { title: 'Your message has been received', next: 'The HAB Secretariat will review your inquiry and reply to you.', adminPath: '/admin/inquiries' },
  donation: { title: 'Donation evidence received', next: 'HAB will review your transfer evidence. This acknowledgement is not a confirmed donation receipt.', adminPath: '/admin/donations' },
};

// Notification failures must not turn an already-saved submission into a failed
// form response: that would encourage duplicate applications or orders.
async function dispatch(options: SendEmailOptions) {
  try { return await sendEmail(options); }
  catch { return { success: false, error: 'Email could not be sent. Review mail settings and the audit log.' }; }
}

export async function notifyStaff(params: { title: string; entityType: string; id: string; reference: string; adminPath: string; siteUrl: string }) {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' }, select: { officialEmail: true } });
    const to = setting?.officialEmail?.trim();
    if (!to) return { success: false, error: 'Configure the Secretariat email address in Admin Settings.' };
    return await dispatch({ to, subject: `HAB · ${params.title} · ${params.reference}`,
      body: `${params.title}\nReference: ${params.reference}\n\nSign in to review the record: ${new URL(params.adminPath, params.siteUrl).href}\n\nCheck any submitted transfer evidence against the bank before confirming payment.`,
      templateKey: 'staff_notification', auditEntityType: params.entityType, auditEntityId: params.id });
  } catch { return { success: false, error: 'Staff notification could not be sent.' }; }
}

export async function notifySubmission(params: { kind: SubmissionKind; email: string; name: string; id: string; reference: string; siteUrl: string }) {
  const info = submissions[params.kind];
  const [customer, staff] = await Promise.all([
    dispatch({ to: params.email, subject: `HAB · ${info.title} · ${params.reference}`,
      body: `Kuzuzangpo la ${params.name},\n\n${info.title}.\nReference: ${params.reference}\n\n${info.next}\n\nHandicrafts Association of Bhutan`,
      templateKey: `${params.kind}_received`, auditEntityType: params.kind, auditEntityId: params.id }),
    notifyStaff({ title: info.title, entityType: params.kind, id: params.id, reference: params.reference, adminPath: info.adminPath, siteUrl: params.siteUrl }),
  ]);
  return { customer, staff };
}

type OrderState = { orderStatus: string; paymentStatus: string };
export function orderNotificationEvents(previous: OrderState, current: OrderState) {
  const events: string[] = [];
  if (previous.paymentStatus !== current.paymentStatus && ['PAID', 'FAILED', 'REFUNDED'].includes(current.paymentStatus)) events.push(`payment_${current.paymentStatus.toLowerCase()}`);
  if (previous.orderStatus !== current.orderStatus && ['PROCESSING', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(current.orderStatus)) {
    if (!(current.orderStatus === 'REFUNDED' && events.includes('payment_refunded'))) events.push(`order_${current.orderStatus.toLowerCase()}`);
  }
  return events;
}

export async function notifyOrderUpdate(previous: OrderState, order: OrderState & { id: string; orderNumber: string; customerEmail: string; customerName: string }) {
  const descriptions: Record<string, string> = {
    payment_paid: 'HAB has confirmed your payment.', payment_failed: 'Your payment could not be confirmed. Please contact HAB with your transfer reference before paying again.',
    payment_refunded: 'HAB has recorded your payment as refunded. Contact the Secretariat for settlement details.',
    order_processing: 'Your order is being prepared.', order_delivered: 'Your order has been marked delivered. Please contact HAB if it has not arrived.',
    order_cancelled: 'Your order has been cancelled. If you transferred payment, contact HAB about its return.',
    order_refunded: 'Your order has been marked refunded. Contact HAB for settlement details.',
  };
  const events = orderNotificationEvents(previous, order);
  if (!events.length || !order.customerEmail) return null;
  return dispatch({ to: order.customerEmail, subject: `HAB · Update for order ${order.orderNumber}`,
    body: `Kuzuzangpo la ${order.customerName},\n\nOrder: ${order.orderNumber}\n\n${events.map(event => descriptions[event]).join('\n')}\n\nHandicrafts Association of Bhutan`,
    templateKey: events.join(','), auditEntityType: 'Order', auditEntityId: order.id });
}

export async function notifyDonationStatus(previousStatus: string | undefined, donation: { id: string; status: string; donorEmail: string; donorName: string; receiptNumber: string; amountUSD: number }) {
  if (previousStatus === donation.status || !donation.donorEmail) return null;
  const descriptions: Record<string, string> = {
    COMPLETED: 'HAB has verified and confirmed your donation. Thank you for your support.',
    FAILED: 'Your donation payment could not be confirmed. Please contact HAB with your transfer reference before paying again.',
    CANCELLED: 'Your donation record has been cancelled. Contact HAB if you have already transferred funds.',
    REFUNDED: 'HAB has recorded your donation as refunded. Contact the Secretariat for settlement details.',
  };
  if (!descriptions[donation.status]) return null;
  return dispatch({ to: donation.donorEmail, subject: `HAB · Donation update · ${donation.receiptNumber}`,
    body: `Kuzuzangpo la ${donation.donorName},\n\nReference: ${donation.receiptNumber}\nRecorded amount: USD ${Number(donation.amountUSD).toFixed(2)}\n\n${descriptions[donation.status]}\n\nHandicrafts Association of Bhutan`,
    templateKey: `donation_${donation.status.toLowerCase()}`, auditEntityType: 'DonationRecord', auditEntityId: donation.id });
}
