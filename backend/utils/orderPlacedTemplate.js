export const orderPlacedTemplate = ({ name, orderId, total }) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Order Confirmed 🎉</h2>
      <p>Hi <strong>${name}</strong>,</p>

      <p>Your order has been successfully placed.</p>

      <p>
        <strong>Order ID:</strong> ${orderId}<br/>
        <strong>Total Amount:</strong> ₹${total}
      </p>

      <p>
        Please find your invoice attached as a PDF.
      </p>

      <p>
        We’ll notify you when your order moves forward.
      </p>

      <br/>
      <p>Thanks,<br/>Your Store Team</p>
    </div>
  `;
};
