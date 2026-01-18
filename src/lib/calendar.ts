export function generateICS({
  title,
  description,
  location,
  startDate,
  endDate,
  organizerEmail,
  attendeeEmail,
}: {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  organizerEmail: string;
  attendeeEmail: string;
}): string {
  // ISO 8601 formatına çevir (UTC)
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Randevu Sistemi//TR
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@randevu.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
${location ? `LOCATION:${location}` : ""}
ORGANIZER;CN=Admin:mailto:${organizerEmail}
ATTENDEE;CN=${attendeeEmail};RSVP=TRUE:mailto:${attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Randevunuz 30 dakika sonra
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return ics;
}
