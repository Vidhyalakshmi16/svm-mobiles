import PDFDocument from "pdfkit";

const generateInvoicePdf = (order, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("Sri Vaari Mobiles", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Status: ${order.status}`);
  doc.text(`Payment: ${order.paymentMethod}`);
  doc.moveDown();

  doc.text("Items:");
  doc.moveDown(0.5);

  order.items.forEach((item, i) => {
    doc.text(
      `${i + 1}. ${item.name} × ${item.quantity} – ₹${item.finalPrice || item.price}`
    );
  });

  doc.moveDown();
  doc.text(`Total Amount: ₹${order.total}`, { align: "right" });

  doc.end();
};

export default generateInvoicePdf;
