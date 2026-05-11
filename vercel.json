import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const supabase = createClient(
  'https://flzmjecipfzurnkunyku.supabase.co',
  process.env.SUPABASE_SECRET_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Securitate: verifica secret pentru cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Ia toate alertele active
    const { data: alerte } = await supabase
      .from('price_alerts')
      .select('id, user_email, target_price, product_id, products (name, listings (price))')
      .eq('active', true)

    if (!alerte || alerte.length === 0) {
      return NextResponse.json({ message: 'Nicio alerta activa', sent: 0 })
    }

    let sent = 0
    const results = []

    for (const alerta of alerte) {
      const produs: any = alerta.products
      if (!produs || !produs.listings || produs.listings.length === 0) continue

      const preturi = produs.listings.map((l: any) => l.price)
      const pretMin = Math.min(...preturi)

      // Daca pretul curent e sub pretul tinta -> trimite email
      if (pretMin <= alerta.target_price) {
        try {
          await resend.emails.send({
            from: 'farmaciepret <onboarding@resend.dev>',
            to: alerta.user_email,
            subject: 'Alerta pret: ' + produs.name + ' este acum ' + pretMin + ' lei!',
            html: '<h2>Vesti bune!</h2>' +
              '<p>Produsul <strong>' + produs.name + '</strong> a scazut sub pretul tau tinta.</p>' +
              '<ul>' +
              '<li><strong>Pret curent:</strong> ' + pretMin + ' lei</li>' +
              '<li><strong>Pret tinta:</strong> ' + alerta.target_price + ' lei</li>' +
              '</ul>' +
              '<p><a href="https://farmaciepret.ro/produs/' + alerta.product_id + '">Vezi produsul pe site</a></p>' +
              '<p style="font-size:12px;color:#888;">Acest email a fost trimis pentru ca ai setat o alerta pe farmaciepret.ro</p>'
          })

          // Dezactiveaza alerta (sa nu mai trimita iar)
          await supabase
            .from('price_alerts')
            .update({ active: false })
            .eq('id', alerta.id)

          sent++
          results.push({ email: alerta.user_email, produs: produs.name, status: 'sent' })
        } catch (err) {
          results.push({ email: alerta.user_email, produs: produs.name, status: 'error' })
        }
      }
    }

    return NextResponse.json({
      message: 'Verificare completa',
      total_alerte: alerte.length,
      emailuri_trimise: sent,
      results
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}