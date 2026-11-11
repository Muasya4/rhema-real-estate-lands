import {
  serializeJsonLd,
  type JsonLdSchema,
} from "@/lib/seo/json-ld";

export function JsonLd({ schema }: { schema: JsonLdSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
}
