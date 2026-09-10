import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & delivery policy · Handicrafts Association of Bhutan',
  description: 'How orders placed with the Handicrafts Association of Bhutan are packed, shipped, charged and returned.',
};

export default function ShippingPolicyPage() {
  return (
    <main id="main">
      <section className="section">
        <p className="crumbs">
          <Link href="/">Home</Link> / <Link href="/shop">E-shop</Link> / Shipping &amp; delivery policy
        </p>
        <h1 className="display display--page">Shipping &amp; delivery policy</h1>
        <p className="lede">
          How orders placed with the Handicrafts Association of Bhutan are packed, shipped, charged
          and returned. Last reviewed September 2026.
        </p>
      </section>

      <section className="section section--last">
        <div className="policy">
          {/* Sticky On-Page Nav */}
          <nav className="policy__nav" aria-label="On this page">
            <a href="#dispatch">Dispatch &amp; handling</a>
            <a href="#methods">Methods &amp; delivery times</a>
            <a href="#charges">Charges</a>
            <a href="#free">Free EMS conditions</a>
            <a href="#duty">Duty, taxes &amp; customs</a>
            <a href="#tracking">Tracking</a>
            <a href="#returns">Returns &amp; refunds</a>
            <a href="#damage">Damage &amp; loss</a>
            <a href="#trade">Wholesale consignments</a>
          </nav>

          {/* Policy Content Body */}
          <div className="policy__body">
            <h2 id="dispatch">Dispatch &amp; handling</h2>
            <p>
              Orders are picked, checked and packed at the HAB office in Thimphu. Stocked pieces leave
              within two working days of payment clearing. Made-to-order and commissioned work is
              dispatched on the lead time quoted at the time of order, which is set by the artisan and
              confirmed in writing before we take payment.
            </p>
            <p>
              Every piece is wrapped by hand. Textiles travel folded in acid-free tissue; turned wood,
              ceramics and cast metal travel double-boxed. We do not ship on Bhutanese national holidays.
            </p>

            <h2 id="methods">Methods &amp; delivery times</h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Destination</th>
                    <th>Working days</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Standard EMS / Bhutan Post, tracked</td>
                    <td>Worldwide</td>
                    <td>7–14</td>
                  </tr>
                  <tr>
                    <td>Express courier, tracked</td>
                    <td>Worldwide</td>
                    <td>3–5</td>
                  </tr>
                  <tr>
                    <td>Domestic courier</td>
                    <td>Within Bhutan</td>
                    <td>1–3</td>
                  </tr>
                  <tr>
                    <td>Collection in person</td>
                    <td>HAB office, Thimphu</td>
                    <td>By appointment</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Times run from dispatch, not from order, and exclude customs clearance in the destination
              country. Remote addresses may add two to three days.
            </p>

            <h2 id="charges">Charges</h2>
            <p>
              Shipping is calculated at checkout from the destination and the volumetric weight of the
              packed consignment. The figure shown before payment is the figure charged; we do not
              invoice a shortfall afterwards. Oversized, fragile or high-value consignments are quoted
              individually and confirmed with you before dispatch.
            </p>

            <h2 id="free">Free EMS conditions</h2>
            <p>
              Standard EMS delivery is free of charge where all of the following apply. These conditions
              are stated here and nowhere else; where a promotion elsewhere on the site conflicts with
              this section, this section governs.
            </p>
            <ul>
              <li>The order is a retail order placed through the HAB e-shop.</li>
              <li>
                The goods value is USD 200 or more, calculated after any discount and before shipping,
                duty and local taxes.
              </li>
              <li>The order ships to a single delivery address in one consignment.</li>
              <li>
                The service selected is standard EMS / Bhutan Post. Express courier is charged in full.
              </li>
              <li>
                The packed consignment does not exceed 10 kg volumetric weight and is not classed as
                oversized or specially crated.
              </li>
              <li>
                The order is not a wholesale, trade or made-to-order consignment, which ship on the trade
                terms in your account.
              </li>
            </ul>
            <p>
              Where a buyer asks for an order to be split across shipments or addresses, the first
              shipment carries the free-delivery entitlement and the remainder are charged at the rates
              above. If a returned item takes the order value below USD 200, the shipping we absorbed is
              deducted from the refund.
            </p>

            <h2 id="duty">Duty, taxes &amp; customs</h2>
            <p>
              Prices on this site exclude import duty, sales tax, VAT, GST and customs brokerage in the
              destination country. These are set by your own government, collected by the carrier or the
              customs authority, and payable by you on delivery. HAB cannot estimate them and cannot pay
              them on your behalf.
            </p>
            <p>
              Every consignment carries an accurate customs declaration stating the goods, their value
              and their Bhutanese origin. We will not under-declare a value or describe a purchase as a
              gift. Where a certificate of origin, a CITES statement or an antiquity clearance is
              needed, the office will supply it — tell us before dispatch. Consignments refused or
              abandoned at customs are treated as a return and refunded less shipping and any charges
              incurred.
            </p>

            <h2 id="tracking">Tracking</h2>
            <p>
              A tracking number is emailed on dispatch. If tracking has not moved for seven working
              days, write to the retail desk through the{' '}
              <Link href="/contact?topic=order" className="text-[#8B2E24] hover:underline">
                enquiry form
              </Link>{' '}
              with your order reference and we will open a case with the carrier.
            </p>

            <h2 id="returns">Returns &amp; refunds</h2>
            <p>
              Tell us within 14 days of delivery if you wish to return a piece, and send it back within
              30 days. Returns must be unused, in their original wrapping, and sent by a tracked
              service. The return address is issued with your authorisation — parcels sent without one
              cannot be traced to your order.
            </p>
            <p>
              Refunds are made to the original payment method within 10 working days of the piece
              arriving and being checked, for the goods value. Outbound shipping is refunded only where
              the piece was faulty, damaged or not what was ordered. Return postage is yours except in
              those cases.
            </p>
            <h3>What cannot be returned</h3>
            <ul>
              <li>Commissioned and made-to-order work produced to your specification.</li>
              <li>Pieces altered, tailored or personalised at your request.</li>
              <li>Pieces damaged after delivery by use, cleaning or storage.</li>
            </ul>
            <p>
              Handmade work varies. Grain, weave density, dye depth and small irregularities are
              characteristics of the craft, not faults, and are not grounds for return. Photographs are
              representative of the piece you receive.
            </p>

            <h2 id="damage">Damage &amp; loss</h2>
            <p>
              Report damage in transit within 48 hours of delivery, with photographs of the piece and
              the outer packaging. Report a non-delivery once the carrier has declared the consignment
              lost. In either case we replace the piece where the artisan can remake it, and refund in
              full where they cannot.
            </p>

            <h2 id="trade">Wholesale consignments</h2>
            <p>
              Wholesale and bulk orders ship on the incoterms, lead times and freight arrangements
              agreed in your trade account. Free delivery does not apply. Consolidated sea and air
              freight, palletisation and export documentation are arranged by the trade desk — raise it
              through the{' '}
              <Link href="/contact?topic=wholesale" className="text-[#8B2E24] hover:underline">
                enquiry form
              </Link>{' '}
              or your account manager.
            </p>

            <h2>Questions</h2>
            <p>
              Write to the retail desk through the{' '}
              <Link href="/contact?topic=order" className="text-[#8B2E24] hover:underline">
                contact form
              </Link>
              , email officehab@gmail.com, or telephone +975-2-338089 between 09:00 and 17:00 BTT,
              Monday to Friday.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
