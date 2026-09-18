import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, SmtpConfig } from '@/lib/email-service';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toEmail, host, port, secure, username, password, fromName, fromEmail } = body;

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid recipient email address is required.' },
        { status: 400 }
      );
    }

    const testConfig: SmtpConfig = {
      host: host || undefined,
      port: port ? Number(port) : undefined,
      secure: secure === true,
      username: username || undefined,
      password: password || undefined,
      fromName: fromName || 'Handicrafts Association of Bhutan (Test)',
      fromEmail: fromEmail || 'officehab@gmail.com',
    };

    const subject = 'Test Diagnostic Email · Handicrafts Association of Bhutan Mailer';
    const bodyText = `Kuzuzangpo la,

This is a test notification confirming that the live SMTP outbound transport for the Handicrafts Association of Bhutan platform is operating successfully.

Timestamp: ${new Date().toISOString()}
Configured Host: ${testConfig.host || '(Simulated / Default relay)'}
Configured Port: ${testConfig.port || 587}
Secure SSL/TLS: ${testConfig.secure ? 'Enabled' : 'Disabled'}
Sender Identity: "${testConfig.fromName}" <${testConfig.fromEmail}>

Recipient Verification: ${toEmail}

If you received this message, your email dispatch credentials in Admin Settings are valid and functioning.

Handicrafts Association of Bhutan (HAB)
CSO Registration No: CSO/2011/043 · Thimphu, Kingdom of Bhutan`;

    const result = await sendEmail({
      to: toEmail.trim(),
      subject,
      body: bodyText,
      customConfig: testConfig,
      auditEntityType: 'SmtpTest',
      auditEntityId: toEmail.trim(),
    });

    if (result.success) {
      await logAudit({
        actorType: 'STAFF',
        actorId: 'admin',
        actorIdentifier: 'Admin Staff Operator',
        action: 'EMAIL_TEST_DISPATCHED',
        entityType: 'EmailSettings',
        entityId: toEmail.trim(),
        details: {
          to: toEmail,
          host: testConfig.host,
          simulated: result.simulated,
          messageId: result.messageId,
        },
      });

      return NextResponse.json({
        success: true,
        message: result.simulated
          ? `✓ Test email dispatch simulated successfully. (No SMTP host was entered, so it ran in zero-crash test mode).`
          : `✓ Live test email delivered successfully via ${testConfig.host}! Message ID: ${result.messageId}`,
        simulated: result.simulated,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to dispatch test email via configured SMTP server.',
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Error in test email route:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error executing test email.' },
      { status: 500 }
    );
  }
}
