import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <section
          className="route-empty-state property-detail-not-found"
          aria-labelledby="property-not-found-title"
        >
          <h1 className="section-title" id="property-not-found-title">
            This property page is not available.
          </h1>
          <p>
            The property may have been removed or is not published for public
            viewing.
          </p>
          <Link className="button button--primary-outlined" href="/properties">
            View properties
          </Link>
        </section>
      </div>
    </main>
  );
}
