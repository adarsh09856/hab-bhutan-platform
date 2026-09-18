import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

const DEFAULT_TEMPLATES: Record<string, EmailTemplate> = {
  order_confirmation: {
    subject: 'Order Confirmation #{{orderNumber}} · Handicrafts Association of Bhutan',
    body: `Kuzuzangpo la {{customerName}},

Thank you for supporting community artisans through the Handicrafts Association of Bhutan. Your order #{{orderNumber}} has been placed and received by our fulfillment center in Thimphu.

Order Total: {{totalAmount}}
Payment Method: {{paymentMethod}}
Shipping Method: {{shippingMethod}}

We will notify you with Bhutan Post EMS tracking once dispatched.

Each authentic Bhutanese handicraft carries verified provenance under the CSO Act of Bhutan 2007 (Registration CSO/2011/043).

Track live anytime: {{trackingUrl}}

Warm regards,
Secretariat Desk
Handicrafts Association of Bhutan · Thimphu, Kingdom of Bhutan
officehab@gmail.com · +975-2-338089`,
  },
  order_shipped: {
    subject: 'Your HAB Order #{{orderNumber}} Has Shipped via EMS Bhutan Post',
    body: `Kuzuzangpo la {{customerName}},

Your handcrafted order #{{orderNumber}} has departed our Thimphu hub and is en route via {{shippingMethod}}.

EMS Tracking Number: {{trackingNumber}}
Track live anytime at: {{trackingUrl}}
Bhutan Post International Portal: https://www.bhutanpost.bt/

Each piece in your consignment is accompanied by an official Zorig Chusum certificate of authenticity.

Thank you for sustaining living heritage and rural artisan livelihoods in Bhutan.

Warm regards,
Fulfillment Logistics Center
Handicrafts Association of Bhutan
officehab@gmail.com`,
  },
  application_approved: {
    subject: 'Welcome to HAB · Your Artisan Membership Application is Approved',
    body: `Kuzuzangpo la {{applicantName}},

Congratulations! The HAB Secretariat has verified your citizenship credentials and craft background. Your membership application has been approved under official registration #{{regNumber}}.

You are now connected to our national network of over 7,500 craft practitioners across all 20 dzongkhags.

Please complete your member profile and portal activation:
{{activationUrl}}

For queries, contact the Secretariat at officehab@gmail.com or call +975-2-338089.

Handicrafts Association of Bhutan
CSO/2011/043 · Thimphu, Bhutan`,
  },
  application_rejected: {
    subject: 'Update Regarding Your HAB Membership Application',
    body: `Kuzuzangpo la {{applicantName}},

Thank you for your interest in joining the Handicrafts Association of Bhutan. Following verification review, your membership application could not be approved at this stage.

Reason for decision:
{{rejectionReason}}

You may submit an amended application with verified documentation, or reach out directly to the Membership Committee at officehab@gmail.com.

Warm regards,
Membership Secretariat
Handicrafts Association of Bhutan`,
  },
};

/**
 * Retrieves effective SMTP settings from SiteSetting in PostgreSQL with fallback to process.env
 */
export async function getEffectiveSmtpConfig(): Promise<SmtpConfig> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: { emailSettings: true, officialEmail: true },
    });

    const es = (setting?.emailSettings as any) || {};

    return {
      host: es.host || process.env.SMTP_HOST || '',
      port: Number(es.port || process.env.SMTP_PORT || 587),
      secure: es.secure === true || process.env.SMTP_SECURE === 'true',
      username: es.username || process.env.SMTP_USER || '',
      password: es.password || process.env.SMTP_PASS || '',
      fromName: es.fromName || process.env.SMTP_FROM_NAME || 'Handicrafts Association of Bhutan',
      fromEmail: es.fromEmail || setting?.officialEmail || process.env.SMTP_FROM_EMAIL || 'officehab@gmail.com',
    };
  } catch (err) {
    console.warn('[email-service] Failed to read database emailSettings, falling back to env vars:', err);
    return {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      username: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASS || '',
      fromName: process.env.SMTP_FROM_NAME || 'Handicrafts Association of Bhutan',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'officehab@gmail.com',
    };
  }
}

/**
 * Replaces all {{variable}} tags in a template string
 */
export function replacePlaceholders(template: string, variables: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : '';
  });
}

/**
 * Fetches an email template by key from SiteSetting with fallback to DEFAULT_TEMPLATES
 */
export async function getEmailTemplate(templateKey: string): Promise<EmailTemplate> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: { emailTemplates: true },
    });

    const dbTemplates = (setting?.emailTemplates as any) || {};
    if (dbTemplates[templateKey]?.subject && dbTemplates[templateKey]?.body) {
      return {
        subject: dbTemplates[templateKey].subject,
        body: dbTemplates[templateKey].body,
      };
    }
  } catch (err) {
    console.warn(`[email-service] Could not load template ${templateKey} from DB:`, err);
  }

  return DEFAULT_TEMPLATES[templateKey] || {
    subject: 'Notification from Handicrafts Association of Bhutan',
    body: 'Kuzuzangpo la,\n\nThis is an automated notification from HAB.',
  };
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
  templateKey?: string;
  auditEntityType?: string;
  auditEntityId?: string;
  customConfig?: SmtpConfig;
}

/**
 * Core sendEmail dispatcher with live SMTP sending and resilient simulation mode
 */
export async function sendEmail(opts: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}> {
  const config = opts.customConfig || (await getEffectiveSmtpConfig());

  const hasCredentials = Boolean(config.host && config.host.trim().length > 0);

  // If no SMTP host is configured, simulate cleanly and log to audit trail
  if (!hasCredentials) {
    console.log(`[EMAIL_SERVICE:SIMULATED] Dispatched email to ${opts.to} | Subject: "${opts.subject}"`);

    await logAudit({
      actorType: 'SYSTEM',
      actorId: 'system',
      actorIdentifier: 'Automated Email Engine (Simulated)',
      action: 'EMAIL_DISPATCH_SIMULATED',
      entityType: opts.auditEntityType || 'Email',
      entityId: opts.auditEntityId || opts.to,
      details: {
        to: opts.to,
        subject: opts.subject,
        templateKey: opts.templateKey || 'custom',
        reason: 'SMTP host not configured. Live dispatch simulated successfully.',
      },
    });

    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port || 587,
      secure: config.secure || false,
      auth: config.username
        ? {
            user: config.username,
            pass: config.password || '',
          }
        : undefined,
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocks on custom VPS mail relays
      },
    });

    const fromAddress = `"${config.fromName}" <${config.fromEmail}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: opts.to,
      subject: opts.subject,
      text: opts.body,
      html: opts.html || `<div style="font-family: sans-serif; white-space: pre-line; line-height: 1.6; color: #1e293b;">${opts.body}</div>`,
    });

    console.log(`[EMAIL_SERVICE:LIVE] Email delivered to ${opts.to}. MessageID: ${info.messageId}`);

    await logAudit({
      actorType: 'SYSTEM',
      actorId: 'system',
      actorIdentifier: 'Automated Email Engine',
      action: 'EMAIL_DISPATCH_DELIVERED',
      entityType: opts.auditEntityType || 'Email',
      entityId: opts.auditEntityId || opts.to,
      details: {
        to: opts.to,
        subject: opts.subject,
        messageId: info.messageId,
        templateKey: opts.templateKey || 'custom',
      },
    });

    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`[EMAIL_SERVICE:ERROR] Failed to send email to ${opts.to}:`, err.message);

    await logAudit({
      actorType: 'SYSTEM',
      actorId: 'system',
      actorIdentifier: 'Automated Email Engine',
      action: 'EMAIL_DISPATCH_FAILED',
      entityType: opts.auditEntityType || 'Email',
      entityId: opts.auditEntityId || opts.to,
      details: {
        to: opts.to,
        subject: opts.subject,
        errorMessage: err.message,
        templateKey: opts.templateKey || 'custom',
      },
    });

    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Dispatches automated order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(params: {
  order: any;
  customerEmail: string;
  customerName: string;
  siteUrl?: string;
}): Promise<void> {
  try {
    const template = await getEmailTemplate('order_confirmation');
    const baseUrl = params.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://hab.org.bt';
    const trackingUrl = `${baseUrl}/track-order?order=${encodeURIComponent(params.order.orderNumber)}&email=${encodeURIComponent(params.customerEmail)}`;

    const formattedTotal = params.order.currencyUsed === 'BTN'
      ? `Nu. ${Number(params.order.totalPaidCurrency || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : `$${Number(params.order.totalUSD || 0).toFixed(2)} USD`;

    const variables = {
      orderNumber: params.order.orderNumber,
      customerName: params.customerName || 'Valued Collector',
      totalAmount: formattedTotal,
      paymentMethod: params.order.paymentMethod || 'International Card',
      shippingMethod: params.order.carrier || 'EMS Bhutan Post',
      trackingUrl,
    };

    const subject = replacePlaceholders(template.subject, variables);
    const body = replacePlaceholders(template.body, variables);

    await sendEmail({
      to: params.customerEmail,
      subject,
      body,
      templateKey: 'order_confirmation',
      auditEntityType: 'Order',
      auditEntityId: params.order.id,
    });
  } catch (err) {
    console.error('[email-service] Error sending order confirmation email:', err);
  }
}

/**
 * Dispatches automated shipping notice with tracking details
 */
export async function sendOrderShippedEmail(params: {
  order: any;
  trackingNumber: string;
  carrier?: string;
  customerEmail: string;
  customerName?: string;
  siteUrl?: string;
}): Promise<void> {
  try {
    const template = await getEmailTemplate('order_shipped');
    const baseUrl = params.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://hab.org.bt';
    const trackingUrl = `${baseUrl}/track-order?order=${encodeURIComponent(params.order.orderNumber)}&email=${encodeURIComponent(params.customerEmail)}`;

    const variables = {
      orderNumber: params.order.orderNumber,
      customerName: params.customerName || params.order.customerName || 'Valued Collector',
      trackingNumber: params.trackingNumber,
      shippingMethod: params.carrier || params.order.carrier || 'EMS Bhutan Post',
      trackingUrl,
    };

    const subject = replacePlaceholders(template.subject, variables);
    const body = replacePlaceholders(template.body, variables);

    await sendEmail({
      to: params.customerEmail,
      subject,
      body,
      templateKey: 'order_shipped',
      auditEntityType: 'Order',
      auditEntityId: params.order.id,
    });
  } catch (err) {
    console.error('[email-service] Error sending order shipped email:', err);
  }
}

/**
 * Dispatches membership decision email (approval or rejection)
 */
export async function sendMembershipStatusEmail(params: {
  application: any;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  regNumber?: string;
  activationUrl?: string;
}): Promise<void> {
  try {
    const isApproved = params.status === 'APPROVED';
    const templateKey = isApproved ? 'application_approved' : 'application_rejected';
    const template = await getEmailTemplate(templateKey);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hab.org.bt';
    const activationUrl = params.activationUrl || `${baseUrl}/portal/activate?id=${params.application.id}`;

    const variables = {
      applicantName: params.application.fullName || params.application.name || 'Artisan Applicant',
      regNumber: params.regNumber || params.application.regNumber || 'HAB-MEM-PENDING',
      activationUrl,
      rejectionReason: params.rejectionReason || 'Incomplete verification documentation or non-compliant craft credentials.',
    };

    const subject = replacePlaceholders(template.subject, variables);
    const body = replacePlaceholders(template.body, variables);

    await sendEmail({
      to: params.application.email,
      subject,
      body,
      templateKey,
      auditEntityType: 'MembershipApplication',
      auditEntityId: params.application.id,
    });
  } catch (err) {
    console.error('[email-service] Error sending membership status email:', err);
  }
}
