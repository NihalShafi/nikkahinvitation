# Mohammed Rihab & Tafzeena — Nikkah Invitation

Next.js App Router invitation site with Tailwind CSS, Framer Motion, Three.js scroll-driven wedding rings, Lucide icons, and the supplied nasheed at `public/nasheed.mp3`. After filling the RSVP, guests can open WhatsApp with a prefilled message and send it to the configured number.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To change the WhatsApp destination, edit `WHATSAPP_NUMBER` near the top of `app/page.tsx`; use the country code and digits only, without `+` or spaces. Guests still need to tap Send in WhatsApp.
