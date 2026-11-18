"use client";

import { AnimatePresence, motion } from "framer-motion";
import ThreeBond from "./three-bond";
import { ArrowDown, ArrowUp, CalendarPlus, CalendarDays, Clock3, MapPin, MessageCircle, Music2, VolumeX, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

const eventDate = new Date("2026-12-05T11:00:00+04:00");
// Change this to the hosts' WhatsApp number, including country code and digits only.
const WHATSAPP_NUMBER = "918921022071";
type Countdown = { days: number; hours: string; minutes: string; seconds: string };
const emptyCountdown: Countdown = { days: 0, hours: "00", minutes: "00", seconds: "00" };

function getCountdown(): Countdown {
  let remaining = Math.max(0, eventDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86_400_000); remaining %= 86_400_000;
  const hours = Math.floor(remaining / 3_600_000); remaining %= 3_600_000;
  const minutes = Math.floor(remaining / 60_000); remaining %= 60_000;
  const seconds = Math.floor(remaining / 1_000);
  return { days, hours: String(hours).padStart(2, "0"), minutes: String(minutes).padStart(2, "0"), seconds: String(seconds).padStart(2, "0") };
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.7, ease: "easeOut" }}>{children}</motion.div>;
}

export default function InvitationPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [coverOpen, setCoverOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(emptyCountdown);
  const [attending, setAttending] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [thankMessage, setThankMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setCountdown(getCountdown());
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    } else {
      audio.pause(); setPlaying(false);
    }
  }

  async function openInvitation() {
    setCoverOpen(true);
    const audio = audioRef.current;
    if (audio) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    }
  }

  function addToCalendar() {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rihab and Tafzeena//Nikkah//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:rihab-tafzeena-nikkah-20261205", "DTSTAMP:20260101T000000Z", "DTSTART;TZID=Asia/Dubai:20261205T110000", "DTEND;TZID=Asia/Dubai:20261205T140000",
      "SUMMARY:Nikkah Ceremony — Mohammed Rihab & Tafzeena", "LOCATION:Four Seasons Auditorium\\, Kaithakunda", "DESCRIPTION:Join us to celebrate the Nikkah of Mohammed Rihab and Tafzeena.", "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "rihab-tafzeena-nikkah.ics"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const dua = String(data.get("message") ?? "").trim();
    setGuestName(fullName.split(/\s+/)[0]);
    setThankMessage(attending
      ? "We’re delighted you’ll join us. Thank you for your duas."
      : "We’re grateful for your reply and your duas. You’ll be with us in spirit.");
    const rsvpMessage = attending
      ? `Assalamu alaikum!\nMy name is ${fullName}.\nInshaAllah, I will attend the Nikkah of Mohammed Rihab & Tafzeena on Saturday, December 5, 2026 at 11:00 AM.${phone ? `\nMy phone/WhatsApp: ${phone}.` : ""}${dua ? `\nDua/message: ${dua}` : ""}`
      : `Assalamu alaikum!\nMy name is ${fullName}.\nI’m unable to attend the Nikkah of Mohammed Rihab & Tafzeena on Saturday, December 5, 2026, but I’m sending my duas.${phone ? `\nMy phone/WhatsApp: ${phone}.` : ""}${dua ? `\nDua/message: ${dua}` : ""}`;
    setWhatsappUrl(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rsvpMessage)}`);
    setSubmitted(true);
    window.setTimeout(() => document.getElementById("thankYou")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  return <>
    <audio ref={audioRef} loop preload="none" src="/nasheed.mp3" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <ThreeBond active={coverOpen} />
    <button className="audio-toggle" type="button" onClick={toggleAudio} aria-label={playing ? "Mute background nasheed" : "Play background nasheed"} title={playing ? "Mute nasheed" : "Play nasheed"}>
      {playing ? <VolumeX size={16} aria-hidden="true" /> : <Music2 size={16} aria-hidden="true" />}<span>{playing ? "Mute" : "Play"}</span>
    </button>

    <main>
      <section className="hero" id="home" aria-labelledby="couple-names">
        <div className="hero-frame" />
        <div className="hero-content">
          <p className="eyebrow">A celebration of love &amp; faith</p>
          <p className="arabic bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <p className="invitation-copy">With joyful hearts and gratitude to Allah (SWT),<br className="desktop-only" /> we invite you to bless and celebrate the Nikkah of</p>
          <h1 id="couple-names"><span>Mohammed Rihab</span><i aria-hidden="true">&amp;</i><span>Tafzeena</span></h1>
          <div className="gold-rule"><span>✦</span></div>
          <p className="hero-date">Saturday <span>·</span> December 5, 2026 <span>·</span> 11:00 AM</p>
          <p className="hero-venue">Four Seasons Auditorium <span>—</span> Kaithakunda</p>
          <a className="scroll-cue" href="#blessing"><span>Continue the invitation</span><b aria-hidden="true"><ArrowDown size={16} /></b></a>
        </div>
        <div className="corner corner-tl" /><div className="corner corner-tr" /><div className="corner corner-bl" /><div className="corner corner-br" />
      </section>

      <section className="blessing section-pad" id="blessing">
        <p className="eyebrow">A verse on companionship</p>
        <Reveal className="mihrab"><div className="mihrab-inner"><Sparkles className="ornament" size={22} aria-hidden="true" /><p className="arabic verse" lang="ar" dir="rtl">وَخَلَقْنَاكُمْ أَزْوَاجًا</p><p className="translation">“And We created you in pairs.”</p><p className="reference">SURAH AN-NABA · 78:8</p></div></Reveal>
        <Reveal className="blessing-note">As two hearts become one in the sacred bond of Nikkah, your presence and duas would mean the world to us. Please join Mohammed Rihab and Tafzeena as they begin their journey together.</Reveal>
      </section>

      <section className="details section-pad" id="details">
        <Reveal className="section-heading"><p className="eyebrow">The day we begin</p><h2>Save the date</h2><div className="gold-rule"><span>✦</span></div></Reveal>
        <Reveal className="countdown" aria-label="Countdown to the Nikkah"><div><strong>{countdown.days}</strong><span>Days</span></div><b>:</b><div><strong>{countdown.hours}</strong><span>Hours</span></div><b>:</b><div><strong>{countdown.minutes}</strong><span>Minutes</span></div><b>:</b><div><strong>{countdown.seconds}</strong><span>Seconds</span></div></Reveal>
        <Reveal className="event-card">
          <div className="event-card-top"><span className="event-mark">R <i>&amp;</i> T</span><p className="eyebrow">You are warmly invited</p><h3>Nikkah Ceremony</h3></div>
          <div className="event-info">
            <div><CalendarDays className="info-icon" size={20} aria-hidden="true" /><p><small>DATE</small><strong>Saturday, December 5, 2026</strong></p></div>
            <div><Clock3 className="info-icon" size={20} aria-hidden="true" /><p><small>TIME</small><strong>11:00 AM onwards</strong></p></div>
            <div><MapPin className="info-icon" size={20} aria-hidden="true" /><p><small>VENUE</small><strong>Four Seasons Auditorium, Kaithakunda</strong></p></div>
          </div>
          <div className="event-actions"><a className="button button-outline" target="_blank" rel="noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query=Four+Seasons+Auditorium+Kaithakunda">View on Google Maps <span>↗</span></a><button className="button button-green" onClick={addToCalendar} type="button">Add to Calendar <CalendarPlus size={15} aria-hidden="true" /></button></div>
        </Reveal>
      </section>

      <section className="rsvp section-pad" id="rsvp">
        <Reveal className="section-heading"><p className="eyebrow">Kindly reply</p><h2>Will you join us?</h2><p className="rsvp-intro">Your answer helps us prepare for a day made brighter by your presence.</p></Reveal>
        {!submitted ? <Reveal className="rsvp-form-wrap"><form className="rsvp-form" onSubmit={submitRsvp}>
          <label className="field">Your full name <span>*</span><input name="name" autoComplete="name" required placeholder="e.g. Amina Khan" /></label>
          <label className="field">Phone / WhatsApp <small>Optional</small><input name="phone" type="tel" autoComplete="tel" placeholder="Your number" /></label>
          <fieldset className="attendance"><legend>Will you be attending? <span>*</span></legend><div className="choice-grid">
            <label className="choice"><input type="radio" name="attendance" value="yes" checked={attending} onChange={() => setAttending(true)} required /><span><b>Joyfully attending</b><small>We look forward to seeing you</small></span></label>
            <label className="choice"><input type="radio" name="attendance" value="no" checked={!attending} onChange={() => setAttending(false)} /><span><b>Unable to attend</b><small>Sending our duas</small></span></label>
          </div></fieldset>
          <label className="field">A dua or message <small>Optional</small><textarea name="message" rows={3} placeholder="Share a kind wish with the couple…" /></label>
          <button className="button button-green submit-button" type="submit">Send your reply <span>→</span></button>
          <p className="form-note">Next, open WhatsApp and tap Send to share your prefilled RSVP with the hosts.</p>
        </form></Reveal> : <div className="thank-you" id="thankYou" aria-live="polite"><span className="thank-icon">✦</span><p className="eyebrow">With gratitude</p><h3>Thank you, {guestName}</h3><p>{thankMessage}</p><a className="button button-green whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden="true" /> Continue in WhatsApp</a><p className="form-note">WhatsApp opens with your RSVP filled in. Tap Send there to share it with the hosts.</p><p className="closing arabic" lang="ar" dir="rtl">بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ</p><p className="closing-translation">May Allah bless you both, shower His blessings upon you, and unite you in goodness.</p></div>}
      </section>
    </main>
    <footer><span className="footer-monogram">R <i>&amp;</i> T</span><p>Made with love, in gratitude to Allah.</p><a href="#home">Back to top <ArrowUp size={13} aria-hidden="true" /></a></footer>

    <AnimatePresence>
      {!coverOpen && <motion.section className="envelope-screen" aria-label="Invitation cover" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.8, ease: "easeInOut" } }}>
        <motion.div className="envelope-card" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <div className="envelope-pattern" /><p className="eyebrow">In the name of Allah</p><p className="arabic cover-bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p><div className="cover-monogram">R <i>&amp;</i> T</div><p className="cover-label">Together with their families</p><h2>Mohammed Rihab<br /><i>&amp;</i><br />Tafzeena</h2><p className="cover-invite">request the pleasure of your company<br />at their Nikkah ceremony</p><p className="cover-date">SATURDAY · DECEMBER 5, 2026</p><motion.button className="open-button" id="openInvitation" onClick={openInvitation} type="button" whileTap={{ scale: 0.97 }}>Open your invitation <span><ArrowDown size={15} aria-hidden="true" /></span></motion.button>
        </motion.div>
      </motion.section>}
    </AnimatePresence>
  </>;
}
