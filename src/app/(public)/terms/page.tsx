import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of service · Handicrafts Association of Bhutan',
  description: 'The terms on which HAB provides this website, sells through it, and admits members.',
};

export default function TermsOfServicePage() {
  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / Terms of service
        </p>
        <h1 className="display display--page">Terms of service</h1>
        <p className="lede">
          The terms on which the Handicrafts Association of Bhutan provides this website, sells
          through it, and admits members. Last reviewed September 2026.
        </p>
      </section>

      <section className="section section--last">
        <div className="policy">
          {/* Sticky On-Page Nav */}
          <nav className="policy__nav" aria-label="On this page">
            <a href="#who">Who we are</a>
            <a href="#use">Using this site</a>
            <a href="#accounts">Accounts</a>
            <a href="#membership">Membership</a>
            <a href="#orders">Orders</a>
            <a href="#prices">Prices &amp; payment</a>
            <a href="#authenticity">Authenticity</a>
            <a href="#ip">Intellectual property</a>
            <a href="#liability">Liability</a>
            <a href="#law">Governing law</a>
          </nav>

          {/* Policy Body */}
          <div className="policy__body">
            <h2 id="who">Who we are</h2>
            <p>
              The Handicrafts Association of Bhutan (HAB) is a registered Civil Society Organization
              and Public Benefit Organisation under the Civil Society Organizations Act of Bhutan
              2007, as amended in 2022, registration CSO/2011/043, with its office at Metog Lam,
              Thimphu. In these terms &ldquo;we&rdquo; and &ldquo;HAB&rdquo; mean the association;
              &ldquo;you&rdquo; means a visitor, buyer, member or trade buyer.
            </p>

            <h2 id="use">Using this site</h2>
            <p>
              You may read, download and print material on this site for your own information and for
              research, teaching or trade with the sector. You may not scrape the site, extract
              member or product data in bulk, resell access, or use the material to imply that HAB
              endorses your goods or services.
            </p>
            <p>
              We may change, suspend or withdraw any part of the site at any time. We aim to keep it
              available continuously but do not warrant uninterrupted access.
            </p>

            <h2 id="accounts">Accounts</h2>
            <p>
              Member and trade accounts are issued by the secretariat, are personal to the holder,
              and must not be shared. Tell us at once if you believe your credentials have been
              compromised. We may suspend an account where the terms have been broken or where we are
              required to by law.
            </p>

            <h2 id="membership">Membership</h2>
            <p>
              Membership categories, criteria and dues are set out in the Articles of Association and
              on the membership pages. Applications are considered by the secretariat and, where the
              Articles require it, by the Board of Trustees. Admission is at the association&apos;s
              discretion and dues are payable annually, renewable each July.
            </p>
            <p>
              Dues already paid are not refundable on resignation or expulsion. Affiliated Members do
              not hold a vote and are not eligible for Board of Trustees positions. Members agree to
              the code of conduct and to the authenticity guidance issued by the association.
            </p>

            <h2 id="orders">Orders</h2>
            <p>
              An order placed through the shop is an offer to buy. A contract is formed only when we
              email you an order confirmation. We may decline an order where a piece is no longer
              available, where a price or description was published in error, or where we cannot ship
              lawfully to your destination.
            </p>
            <p>
              Every piece is made by hand and no two are identical. Photographs and measurements are
              representative. Delivery, returns and refunds are governed by the{' '}
              <Link href="/shipping" className="text-[#8B2E24] hover:underline">
                shipping &amp; delivery policy
              </Link>
              , which forms part of these terms.
            </p>
            <p>
              Wholesale and bulk orders are governed additionally by the trade terms in your account:
              minimum order quantities, lead times, tier pricing and incoterms as quoted.
            </p>

            <h2 id="prices">Prices &amp; payment</h2>
            <p>
              Prices are set by HAB in agreement with the maker and are shown in United States dollars
              and Bhutanese ngultrum. The ngultrum figure is a conversion for guidance; the currency
              of charge is stated at checkout. Prices exclude shipping, duty and local taxes.
            </p>
            <p>
              Payment is by international card, Bhutanese mobile payment, or bank transfer against an
              invoice. Card details are handled by the payment provider and are never stored by HAB.
              Where a price was manifestly wrong we will tell you before dispatch and you may cancel.
            </p>

            <h2 id="authenticity">Authenticity</h2>
            <p>
              Every seller in the shop is a registered HAB member with documented craft credentials,
              and HAB buys from the artisan at an agreed price before a piece is listed. We state the
              maker, the craft and the dzongkhag for every piece. We do not sell imported goods as
              Bhutanese work.
            </p>

            <h2 id="ip">Intellectual property</h2>
            <p>
              Text, photographs, diagrams and code on this site belong to HAB or to its members and
              contributors, and are protected by copyright. The HAB name, logo and award marks are
              ours; they may not be used on your packaging, listings or marketing without written
              permission, and award marks may be used only by the holder, for the period stated in the
              citation.
            </p>
            <p>
              Traditional designs, motifs and techniques belong to the communities that hold them.
              Reproducing a member&apos;s design commercially without their agreement is a breach of
              these terms and we will act on a complaint from a member.
            </p>

            <h2 id="liability">Liability</h2>
            <p>
              Editorial content, sector data and guidance on this site are published in good faith for
              general information. They are not professional advice, and we do not warrant that they
              are complete or current. Publication titles, figures and records marked as drafts or
              samples are not to be relied on.
            </p>
            <p>
              Nothing in these terms limits liability for death or personal injury caused by
              negligence, for fraud, or for anything else that cannot lawfully be limited. Subject to
              that, HAB is not liable for indirect or consequential loss, and our total liability in
              connection with an order is limited to the amount you paid for it.
            </p>

            <h2 id="law">Governing law &amp; changes</h2>
            <p>
              These terms are governed by the laws of the Kingdom of Bhutan, and disputes fall to the
              courts of Bhutan. We may revise these terms; the version in force is the one published
              here on the date of your order or application. Material changes affecting members are
              notified before the Annual Sector Forum.
            </p>
            <p>
              Questions, complaints and permission requests go to the secretariat through the{' '}
              <Link href="/contact" className="text-[#8B2E24] hover:underline">
                contact form
              </Link>{' '}
              or to officehab@gmail.com.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
