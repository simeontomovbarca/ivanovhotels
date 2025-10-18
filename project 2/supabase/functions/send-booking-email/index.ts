import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  guestName: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, guestName, hotelName, roomType, checkIn, checkOut, totalPrice, bookingId }: EmailRequest = await req.json();

    const emailBody = `
Здравейте ${guestName},

Благодарим Ви за резервацията в IvanovHotels!

Детайли на резервацията:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Номер на резервация: ${bookingId}
Хотел: ${hotelName}
Тип стая: ${roomType}
Настаняване: ${checkIn}
Напускане: ${checkOut}
Обща цена: ${totalPrice} лв
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Очакваме Ви!

Поздрави,
Екипът на IvanovHotels

Контакти:
Телефон: +359 888 123 456
Email: info@ivanovhotels.bg
    `;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'Email service not configured' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'IvanovHotels <bookings@ivanovhotels.bg>',
        to: [to],
        subject: `Потвърждение на резервация - ${hotelName}`,
        text: emailBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data }),
        {
          status: res.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});