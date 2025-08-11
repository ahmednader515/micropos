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

export async function GET() {
  await prisma.$connect()
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  await prisma.$disconnect()

  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)

  const fontBytes = await getArabicFontBytes()
  const arabicFont = await pdf.embedFont(fontBytes, { subset: true })
  let page = pdf.addPage([595.28, 841.89]) // A4 portrait in points
  let { width, height } = page.getSize()
  const font = arabicFont

  const drawRTL = (text: string, rightX: number, yPos: number, size: number) => {
    const w = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: rightX - w, y: yPos, size, font, color: rgb(0, 0, 0) })
  }

  let y = height - 40
  const rightEdge = width - 40

  // Title (right-aligned)
  drawRTL('الأرصدة الافتتاحية و المبالغ النقدية للعملاء', rightEdge, y, 14)
  y -= 24

  // Columns (RTL): بيانات العميل | له | عليه
  const col1Right = rightEdge // بيانات العميل (largest)
  const col2Right = rightEdge - 320 // له
  const col3Right = rightEdge - 440 // عليه

  drawRTL('بيانات العميل', col1Right, y, 10)
  drawRTL('له', col2Right, y, 10)
  drawRTL('عليه', col3Right, y, 10)
  y -= 16

  for (const c of customers) {
    const balance = Number(c.balance)
    const hasAmount = balance > 0 ? balance : 0
    const oweAmount = balance < 0 ? Math.abs(balance) : 0
    const data = `${c.name}${c.customerNumber ? ` - رقم: ${c.customerNumber}` : ''}${c.phone ? ` - هاتف: ${c.phone}` : ''}`

    drawRTL(data, col1Right, y, 9)
    drawRTL(hasAmount.toFixed(2), col2Right, y, 9)
    drawRTL(oweAmount.toFixed(2), col3Right, y, 9)
    y -= 14
    if (y < 40) {
      page = pdf.addPage([595.28, 841.89])
      ;({ width, height } = page.getSize())
      y = height - 40
    }
  }

  const bytes = await pdf.save()
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="customer_balances.pdf"',
    },
  })
}


