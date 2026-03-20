import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/store';
import type { Order, Profile, OrderItem } from '@/hooks/useStore';

export function generateBudgetPDF(
  order: Order,
  items: OrderItem[],
  profile: Profile | null
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(108, 93, 211); // primary purple
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

  doc.text('ORÇAMENTO', pageWidth - 14, 20, { align: 'right' });
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 30, { align: 'right' });

  // Client info
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

  // Items table
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

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || startY + 60;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Este orçamento é válido por 7 dias.', 14, finalY + 15);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, finalY + 22);

  // Save
  const fileName = `orcamento-${order.client_name.replace(/\s/g, '-').toLowerCase()}-${order.id.slice(0, 6)}.pdf`;
  doc.save(fileName);
}
