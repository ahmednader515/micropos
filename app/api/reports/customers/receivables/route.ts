import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
let cachedFontBytes: Uint8Array | null = null

async function getArabicFontBytes(): Promise<Uint8Array> {
  if (cachedFontBytes) return cachedFontBytes
  const url = 'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoNaskhArabic/NotoNaskhArabic-Regular.ttf'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to download Arabic font')
  const buf = new Uint8Array(await res.arrayBuffer())
  cachedFontBytes = buf
  return buf
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const summary = searchParams.get('summary') === '1'

  await prisma.$connect()
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  await prisma.$disconnect()

  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const fontBytes = await getArabicFontBytes()
  const arabicFont = await pdf.embedFont(fontBytes, { subset: true })
  let page = pdf.addPage([595.28, 841.89])
  let { width, height } = page.getSize()
  const font = arabicFont

  const drawRTL = (text: string, rightX: number, yPos: number, size: number) => {
    const w = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: rightX - w, y: yPos, size, font, color: rgb(0, 0, 0) })
  }

  let y = height - 40
  const rightEdge = width - 40
  drawRTL(summary ? 'ذمم العملاء - تقرير ملخص' : 'ذمم العملاء - المبالغ المتبقية عند العملاء من الفواتير', rightEdge, y, 14)
  y -= 24

  if (summary) {
    const colNameRight = rightEdge
    const colRemainingRight = rightEdge - 200
    drawRTL('العميل', colNameRight, y, 10)
    drawRTL('المتبقي', colRemainingRight, y, 10)
    y -= 16

    for (const c of customers.filter(c => Number(c.balance) > 0)) {
      drawRTL(`${c.name}`, colNameRight, y, 9)
      drawRTL(Number(c.balance).toFixed(2), colRemainingRight, y, 9)
      y -= 14
      if (y < 40) {
        page = pdf.addPage([595.28, 841.89])
        ;({ width, height } = page.getSize())
        y = height - 40
      }
    }
  } else {
    const colDataRight = rightEdge
    const colAmountRight = rightEdge - 240
    drawRTL('بيانات العميل', colDataRight, y, 10)
    drawRTL('المبلغ الباقي', colAmountRight, y, 10)
    y -= 16

    for (const c of customers.filter(c => Number(c.balance) > 0)) {
      const data = `${c.name}${c.customerNumber ? ` - رقم: ${c.customerNumber}` : ''}${c.phone ? ` - هاتف: ${c.phone}` : ''}`
      drawRTL(data, colDataRight, y, 9)
      drawRTL(Number(c.balance).toFixed(2), colAmountRight, y, 9)
      y -= 14
      if (y < 40) {
        page = pdf.addPage([595.28, 841.89])
        ;({ width, height } = page.getSize())
        y = height - 40
      }
    }
  }

  const bytes = await pdf.save()
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${summary ? 'customer_receivables_summary' : 'customer_receivables'}.pdf"`,
    },
  })
}


