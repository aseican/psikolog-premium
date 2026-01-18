import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAppointmentEmail({
  to,
  subject,
  name,
  date,
  time,
  service,
  notes,
  icsFile,
}: {
  to: string;
  subject: string;
  name: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  icsFile: string; // Base64 encoded .ics file
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #0f172a; margin: 0; }
        .info { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .info-label { font-weight: bold; color: #64748b; }
        .info-value { color: #0f172a; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>📅 Randevu Bilgilendirmesi</h1>
          </div>

          <p>Merhaba <strong>${name}</strong>,</p>
          <p>Randevunuz başarıyla oluşturuldu.</p>

          <div class="info">
            <div class="info-row">
              <span class="info-label">Hizmet:</span>
              <span class="info-value">${service}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tarih:</span>
              <span class="info-value">${date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Saat:</span>
              <span class="info-value">${time}</span>
            </div>
            ${notes ? `
            <div class="info-row">
              <span class="info-label">Not:</span>
              <span class="info-value">${notes}</span>
            </div>
            ` : ''}
          </div>

          <p style="text-align: center;">
            <strong>📎 Ekteki .ics dosyasını takvime ekleyebilirsiniz.</strong>
          </p>

          <div class="footer">
            <p>Bu otomatik bir bilgilendirme maildir.</p>
            <p>Sorularınız için: ${process.env.ADMIN_EMAIL}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Randevu Sistemi <onboarding@resend.dev>", // Verified domain kullan
      to,
      subject,
      html,
      attachments: [
        {
          filename: "randevu.ics",
          content: icsFile,
        },
      ],
    });

    if (error) {
      console.error("Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email Exception:", err);
    return { success: false, error: err };
  }
}
