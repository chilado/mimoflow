import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/store';
import type { Order, Profile, OrderItem } from '@/hooks/useStore';

function addHeader(doc: jsPDF, profile: Profile | null, title: string, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(108, 93, 211);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(profile?.company_name || 'PapelariaApp', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (profile?.company_phone) {
    doc.text(profile.company_phone, 14, 30);
  }

  doc.text(title, pageWidth - 14, 20, { align: 'right' });
  doc.text(subtitle, pageWidth - 14, 30, { align: 'right' });
}

export function generateBudgetPDF(
  order: Order,
  items: OrderItem[],
  profile: Profile | null
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  addHeader(doc, profile, 'ORÇAMENTO', `#${order.id.slice(0, 8).toUpperCase()}`);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(order.client_name, 40, 55);

  doc.setFont('helvetica', 'bold');
  doc.text('Tema:', 14, 63);
  doc.setFont('helvetica', 'normal');
  doc.text(order.event_theme || '-', 40, 63);

  doc.setFont('helvetica', 'bold');
  doc.text('Entrega:', 14, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('pt-BR') : '-', 40, 71);

  if (order.personalization) {
    doc.setFont('helvetica', 'bold');
    doc.text('Personalização:', 14, 79);
    doc.setFont('helvetica', 'normal');
    doc.text(order.personalization, 56, 79);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', pageWidth / 2, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status, pageWidth / 2 + 22, 55);

  const startY = order.personalization ? 90 : 82;

  autoTable(doc, {
    startY,
    head: [['Item', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: items.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.quantity * item.unitPrice),
    ]),
    foot: [['', '', 'TOTAL', formatCurrency(Number(order.total))]],
    headStyles: { fillColor: [108, 93, 211], textColor: 255, fontSize: 10 },
    footStyles: { fillColor: [240, 240, 250], textColor: [50, 50, 50], fontStyle: 'bold', fontSize: 11 },
    styles: { fontSize: 10, cellPadding: 5 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 60;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Este orçamento é válido por 7 dias.', 14, finalY + 15);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, finalY + 22);

  const fileName = `orcamento-${order.client_name.replace(/\s/g, '-').toLowerCase()}-${order.id.slice(0, 6)}.pdf`;
  doc.save(fileName);
}

export function generateReceiptPDF(
  order: Order,
  items: OrderItem[],
  profile: Profile | null,
  paymentMethod: string = 'Não informado'
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  addHeader(doc, profile, 'RECIBO', `#${order.id.slice(0, 8).toUpperCase()}`);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);

  let y = 55;
  const addLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 8;
  };

  addLine('Cliente:', order.client_name);
  addLine('Tema:', order.event_theme || '-');
  addLine('Data:', new Date().toLocaleDateString('pt-BR'));
  addLine('Pagamento:', paymentMethod);

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
    headStyles: { fillColor: [108, 93, 211], textColor: 255, fontSize: 10 },
    footStyles: { fillColor: [230, 255, 230], textColor: [30, 100, 30], fontStyle: 'bold', fontSize: 11 },
    styles: { fontSize: 10, cellPadding: 5 },
    alternateRowStyles: { fillColor: [248, 248, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 60;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  const confirmText = `Recebi de ${order.client_name} o valor de ${formatCurrency(Number(order.total))} referente aos itens descritos acima.`;
  doc.text(confirmText, 14, finalY + 15, { maxWidth: pageWidth - 28 });

  doc.setDrawColor(150, 150, 150);
  doc.line(14, finalY + 45, pageWidth / 2, finalY + 45);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(profile?.company_name || 'Assinatura', 14, finalY + 51);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, finalY + 60);

  const fileName = `recibo-${order.client_name.replace(/\s/g, '-').toLowerCase()}-${order.id.slice(0, 6)}.pdf`;
  doc.save(fileName);
}
