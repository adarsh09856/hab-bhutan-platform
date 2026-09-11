import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { PolicyContentRenderer } from '@/components/policy/PolicyContentRenderer';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy policy · Handicrafts Association of Bhutan',
  description: 'What the Handicrafts Association of Bhutan collects, why we hold it, and what you can ask us to do with it.',
};

async function getPrivacyPolicy() {
  try {
    return await prisma.policyPage.findUnique({
      where: { slug: 'privacy' },
    });
  } catch {
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();
  const pageTitle = policy?.title || 'Privacy policy';
  const lastReviewed = policy?.updatedAt
    ? new Date(policy.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'September 2026';

  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / {pageTitle}
        </p>
        <h1 className="display display--page">{pageTitle}</h1>
        <p className="lede">
          What the Handicrafts Association of Bhutan collects, why we hold it, and what you can ask
          us to do with it. Last reviewed {lastReviewed}.
        </p>
      </section>

      <section className="section section--last">
        <div className="policy">
          {/* Sticky On-Page Nav */}
          <nav className="policy__nav" aria-label="On this page">
            <a href="#collect">What we collect</a>
            <a href="#why">Why we hold it</a>
            <a href="#members">Member data</a>
            <a href="#payment">Payment data</a>
            <a href="#cookies">Cookies &amp; local storage</a>
            <a href="#sharing">Who we share it with</a>
            <a href="#retention">How long we keep it</a>
            <a href="#rights">Your rights</a>
            <a href="#security">Security</a>
          </nav>

          {/* Policy Body */}
          <div className="policy__body">
            {policy?.content ? (
              <PolicyContentRenderer content={policy.content} />
            ) : (
              <>
                <h2 id="collect">What we collect</h2>
            <ul>
              <li>
                <strong>Enquiries.</strong> Your name, email, organisation, country and the message you
                send us.
              </li>
              <li>
                <strong>Orders.</strong> Delivery and billing address, telephone number, order contents
                and correspondence about the order.
              </li>
              <li>
                <strong>Membership applications.</strong> The identity, craft, location, business and
                document details set out on the application form.
              </li>
              <li>
                <strong>Trade accounts.</strong> Business registration details, purchasing requirements
                and the contact person you nominate.
              </li>
              <li>
                <strong>Site use.</strong> Aggregate page statistics. We do not build advertising
                profiles and we do not sell data.
              </li>
            </ul>

            <h2 id="why">Why we hold it</h2>
            <p>
              To answer your enquiry, to fulfil and support an order, to administer membership and
              dues, to verify a trade buyer, to meet our reporting obligations as a Public Benefit
              Organisation, and to publish sector statistics in aggregate form. We do not use your
              details for anything else without asking.
            </p>

            <h2 id="members">Member data and the directory</h2>
            <p>
              The public directory deliberately publishes member counts by craft and dzongkhag, not
              7,500 individual listings, and publishes no member contact details. Enquiries for a
              particular artisan or enterprise are routed through the secretariat instead.
            </p>
            <p>
              A member appears by name only where they have given consent, recorded against their
              record. Consent can be withdrawn at any time and the listing is removed at the next
              publication.
            </p>

            <h2 id="payment">Payment data</h2>
            <p>
              Card numbers are entered on the payment provider&apos;s form and are never stored on HAB
              systems. We retain the transaction reference, the amount and the method, which is what
              our auditors require. Bank transfer details are held only for the account they were paid
              from.
            </p>

            <h2 id="cookies">Cookies &amp; local storage</h2>
            <p>
              This site stores a small amount of data in your own browser so that it works: your basket
              and quote basket, your currency preference, a part-completed registration form so you
              can leave and come back, and a signed-in session for members and trade buyers. Clearing
              your browser data removes all of it. We set no advertising or cross-site tracking
              cookies.
            </p>

            <h2 id="sharing">Who we share it with</h2>
            <p>
              Only where it is needed to do what you asked or what the law requires: the carrier and
              customs authority for a shipment, the payment provider for a transaction, our auditors
              and the Civil Society Organizations Authority for statutory reporting, and the maker of
              a piece where a commission or a quality question concerns their work. Donor-funded
              programmes receive reporting in aggregate, never named participant data, unless a
              participant has consented.
            </p>

            <h2 id="retention">How long we keep it</h2>
            <p>
              Enquiries: two years. Orders and financial records: as long as accounting and tax law
              requires. Membership records: for the duration of membership and seven years after it
              ends. Unsuccessful applications: one year. Anything else is deleted when the purpose it
              was collected for has ended.
            </p>

            <h2 id="rights">Your rights</h2>
            <p>
              You may ask us for a copy of what we hold about you, ask us to correct it, ask us to
              delete it where we are not required to keep it, withdraw a consent you gave, and object to
              a use you did not expect. Write to the secretariat through the{' '}
              <Link href="/contact" className="text-[#8B2E24] hover:underline">
                contact form
              </Link>
              . We respond within 30 days and do not charge for a first request.
            </p>
            <p>
              We do not knowingly collect data from children under 16. Where a young artisan under 18
              is enrolled in a training programme, the record is held with the consent of a parent or
              guardian.
            </p>

            <h2 id="security">Security</h2>
            <p>
              Data is held in a managed database with row-level access control, encrypted in transit
              and at rest. Access is limited to named secretariat staff, and administrative sessions
              expire automatically. If a breach affects you, we will tell you and the Authority.
            </p>

            <h2>Changes &amp; contact</h2>
            <p>
              We will post any change here and, where it is material, notify members. The data
              controller is the Handicrafts Association of Bhutan, Metog Lam, Thimphu —{' '}
              <a href="mailto:officehab@gmail.com" className="text-[#8B2E24] hover:underline">
                officehab@gmail.com
              </a>
              , +975-2-338089.
            </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
