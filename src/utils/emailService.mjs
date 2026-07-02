import nodemailer from "nodemailer";
import dns from "dns";

let transporter;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            family: 4,
            lookup: (hostname, options, callback) => {
                dns.lookup(hostname, { family: 4 }, callback);
            },
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
            debug: false
        });
    }
    return transporter;
}

export async function sendOtpEmail(email, name, otp) {
    const mailOptions = {
        from: `"Omnifood 🍔" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Omnifood Verification Code",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#e52a2a,#c0392b);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:2px;">OMNIFOOD</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Healthy meals, delivered fast</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:22px;">Verify your email, ${name.split(" ")[0]}! 👋</h2>
                      <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
                        Thanks for signing up with Omnifood! Use the verification code below to complete your registration. It expires in <strong>10 minutes</strong>.
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background:#fff5f5;border:2px dashed #e52a2a;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
                        <div style="font-size:42px;font-weight:800;color:#e52a2a;letter-spacing:10px;font-family:monospace;">${otp}</div>
                      </div>
                      
                      <p style="margin:0;color:#999;font-size:13px;line-height:1.6;">
                        If you didn't create an Omnifood account, you can safely ignore this email. This code will expire automatically.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                      <p style="margin:0;color:#bbb;font-size:12px;">© 2025 Omnifood · Healthy eating, simplified</p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `
    };

    try {
        await getTransporter().sendMail(mailOptions);
    } catch (error) {
        console.error("sendOtpEmail error:", error);
        throw error;
    }
}
