import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminInquiries } from "@/lib/admin/inquiries/data";

export const metadata: Metadata = {
  title: "Inquiries | Admin",
  robots: { index: false, follow: false },
};

const inquiryDateFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Nairobi",
});

async function AdminInquiriesContent() {
  await requireAdmin();
  const result = await getAdminInquiries();

  const inquiryContent =
    result.status === "error" ? (
      <section className="admin-notice" role="alert">
        <h2>Inquiries could not be loaded.</h2>
        <p>Check the database connection and try again.</p>
      </section>
    ) : result.inquiries.length === 0 ? (
      <section className="admin-notice">
        <h2>No inquiries have been received.</h2>
        <p>New messages submitted through the public inquiry form will appear here.</p>
      </section>
    ) : (
      <section aria-label="Received inquiries" className="admin-inquiry-list">
        {result.inquiries.map((inquiry) => (
          <article className="admin-inquiry-card" key={inquiry.id}>
            <header className="admin-inquiry-header">
              <div>
                <h2>{inquiry.name}</h2>
                <p className="admin-inquiry-date">
                  Received{" "}
                  <time dateTime={inquiry.createdAt}>
                    {inquiryDateFormatter.format(new Date(inquiry.createdAt))}
                  </time>
                </p>
              </div>
              {inquiry.property ? (
                <Link
                  className="text-link admin-inquiry-property"
                  href={`/admin/properties/${inquiry.property.id}`}
                >
                  Property: {inquiry.property.title}
                </Link>
              ) : inquiry.propertyId ? (
                <span className="admin-inquiry-general">
                  Property reference unavailable
                </span>
              ) : (
                <span className="admin-inquiry-general">General inquiry</span>
              )}
            </header>
            <dl className="admin-inquiry-contact">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
                </dd>
              </div>
            </dl>
            <section aria-label={`Message from ${inquiry.name}`}>
              <h3 className="admin-inquiry-message-label">Message</h3>
              <p className="admin-inquiry-message">{inquiry.message}</p>
            </section>
          </article>
        ))}
      </section>
    );

  return (
    <>
      <header className="admin-management-header">
        <div>
          <Link className="text-link" href="/admin">
            Admin home
          </Link>
          <h1 className="route-title">Inquiries</h1>
          <p className="route-description">
            Read messages sent to Rhema through the public inquiry form.
          </p>
        </div>
      </header>
      {inquiryContent}
    </>
  );
}

export default function AdminInquiriesPage() {
  return (
    <main className="admin-management-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Checking admin access...
            </p>
          }
        >
          <AdminInquiriesContent />
        </Suspense>
      </div>
    </main>
  );
}
