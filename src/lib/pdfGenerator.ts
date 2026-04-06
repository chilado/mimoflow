import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/store';
import type { Order, Profile, OrderItem } from '@/hooks/useStore';

type FullProfile = Profile & {
  whatsapp?: string | null;
  instagram?: string | null;
  address?: string | null;
  company_description?: string | null;
};

// MimoFlow brand palette
const C = {
  primary:    [232, 44,  97]  as [number,number,number], // hsl(340 88% 55%) rose
  primarySoft:[253, 228, 238] as [number,number,number], // light rose tint
  accent:     [72,  183, 211] as [number,number,number], // hsl(195 62% 58%) teal
  success:    [53,  186, 120] as [number,number,number], // hsl(152 56% 46%) green
  successSoft:[220, 248, 235] as [number,number,number],
  bg:         [252, 245, 247] as [number,number,number], // hsl(346 40% 97%)
  text:       [38,  18,  26]  as [number,number,number], // dark rose-tinted
  muted:      [140, 110, 120] as [number,number,number],
  white:      [255, 255, 255] as [number,number,number],
  border:     [235, 218, 224] as [number,number,number],
};

async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function normalizePhone(p: string) {
  return p.replace(/\D/g, '');
}

async function addHeader(
  doc: jsPDF,
  profile: FullProfile | null,
  title: string,
  subtitle: string
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerH = 46;

  // Primary rose header
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageWidth, headerH, 'F');

  // Subtle accent stripe at bottom of header
  doc.setFillColor(...C.accent);
  doc.rect(0, headerH - 3, pageWidth, 3, 'F');

  // Logo
  let textX = 14;
  if (profile?.company_logo_url) {
    const b64 = await toBase64(profile.company_logo_url);
    if (b64) {
      const ext = b64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      doc.addImage(b64, ext, 10, 5, 34, 34);
      textX = 50;
    }
  }

  // Company name
  doc.setTextColor(...C.white);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.company_name || 'MimoFlow', textX, 17);

  // Contact
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const waDigits = profile?.whatsapp ? normalizePhone(profile.whatsapp) : '';
  const phoneDigits = profile?.company_phone ? normalizePhone(profile.company_phone) : '';
  const showPhone = phoneDigits && phoneDigits !== waDigits;

  let contactLine = '';
  if (showPhone) contactLine += `Tel: ${profile!.company_phone}  `;
  if (profile?.whatsapp) contactLine += `WhatsApp: ${profile.whatsapp}  `;
  if (profile?.instagram) contactLine += `Instagram: ${profile.instagram}`;
  if (contactLine.trim()) doc.text(contactLine.trim(), textX, 27);
  if (profile?.address) doc.text(profile.address, textX, 35);

  // Title right
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - 14, 17, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth - 14, 27, { align: 'right' });

  return headerH;
}

export async function generateBudgetPDF(
  order: Order,
  items: OrderItem[],
  profile: FullProfile | null
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const headerH = await addHeader(doc, profile, 'ORÇAMENTO', `#${order.id.slice(0, 8).toUpperCase()}`);

  let y = headerH + 10;

  doc.setDrawColor(...C.border);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setTextColor(...C.text);
  doc.setFontSize(10);

  const col2x = pageWidth / 2;
  const field = (label: string, value: string, x: number, yPos: number, labelW = 28) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + labelW, yPos);
  };

  field('Cliente:', order.client_name, 14, y);
  field('Status:', ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status, col2x, y);
  y += 8;
  field('Tema:', order.event_theme || '-', 14, y);
  field('Entrega:', order.delivery_date ? new Date(order.delivery_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-', col2x, y);
  y += 8;

  if (order.personalization) {
    doc.setFont('helvetica', 'bold');
    doc.text('Personalização:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.personalization, 54, y, { maxWidth: pageWidth - 68 });
    y += 10;
  }

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: items.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice),
    ]),
    foot: [['', '', 'TOTAL', formatCurrency(Number(order.total))]],
    headStyles: { fillColor: C.primary, textColor: C.white, fontSize: 10 },
    footStyles: { fillColor: C.primarySoft, textColor: C.primary, fontStyle: 'bold', fontSize: 11 },
    styles: { fontSize: 10, cellPadding: 5, textColor: C.text },
    alternateRowStyles: { fillColor: C.bg },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 60;
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.setFont('helvetica', 'italic');
  doc.text('Este orçamento é válido por 7 dias.', 14, finalY + 12);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, finalY + 19);

  doc.save(`orcamento-${order.client_name.replace(/\s/g, '-').toLowerCase()}-${order.id.slice(0, 6)}.pdf`);
}

export async function generateReceiptPDF(
  order: Order,
  items: OrderItem[],
  profile: FullProfile | null,
  paymentMethod: string = 'Não informado'
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const headerH = await addHeader(doc, profile, 'RECIBO', `#${order.id.slice(0, 8).toUpperCase()}`);

  let y = headerH + 10;

  doc.setDrawColor(...C.border);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setTextColor(...C.text);
  doc.setFontSize(10);

  const field = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 55, y);
    y += 8;
  };

  field('Cliente:', order.client_name);
  field('Tema:', order.event_theme || '-');
  field('Data:', new Date().toLocaleDateString('pt-BR'));
  field('Pagamento:', paymentMethod);

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: items.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice),
    ]),
    foot: [['', '', 'TOTAL PAGO', formatCurrency(Number(order.total))]],
    headStyles: { fillColor: C.primary, textColor: C.white, fontSize: 10 },
    footStyles: { fillColor: C.successSoft, textColor: C.success, fontStyle: 'bold', fontSize: 11 },
    styles: { fontSize: 10, cellPadding: 5, textColor: C.text },
    alternateRowStyles: { fillColor: C.bg },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 60;

  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Recebi de ${order.client_name} o valor de ${formatCurrency(Number(order.total))} referente aos itens descritos acima.`,
    14, finalY + 14, { maxWidth: pageWidth - 28 }
  );

  doc.setDrawColor(...C.border);
  doc.line(14, finalY + 38, pageWidth / 2 - 10, finalY + 38);
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(profile?.company_name || 'Assinatura do Emissor', 14, finalY + 44);

  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, finalY + 54);

  doc.save(`recibo-${order.client_name.replace(/\s/g, '-').toLowerCase()}-${order.id.slice(0, 6)}.pdf`);
}
