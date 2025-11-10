// src/services/email-templates.service.ts
export class EmailTemplatesService {
  static generateOrderConfirmationHTML(order: any): string {
    const itemsHTML = order.order_items.map((item: any) => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>Rp ${item.price.toLocaleString()}</td>
        <td>Rp ${(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    return this.wrapInBaseHTML(`
      <div class="header">
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
      </div>
      <div class="content">
        <p>Hello ${order.user.name},</p>
        <p>Your order has been confirmed and is being processed.</p>
        
        <h3>Order Details:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="total">
          <p>Subtotal: Rp ${(order.total_amount - order.shipping_cost).toLocaleString()}</p>
          <p>Shipping: Rp ${order.shipping_cost.toLocaleString()}</p>
          <p>Total: Rp ${order.total_amount.toLocaleString()}</p>
        </div>
        
        <h3>Shipping Address:</h3>
        <p>${order.address.address_detail}<br>
        ${order.address.district}, ${order.address.city}<br>
        ${order.address.province}</p>
        
        <p>We'll notify you when your order ships.</p>
        <p>Best regards,<br>Online Grocery Store Team</p>
      </div>
    `, '#4CAF50');
  }

  static generatePaymentConfirmationHTML(order: any): string {
    return this.wrapInBaseHTML(`
      <div class="header">
        <h1>Payment Confirmed</h1>
      </div>
      <div class="content">
        <p>Hello ${order.user.name},</p>
        <p>We've received your payment for order <strong>#${order.id}</strong>.</p>
        <p><strong>Amount Paid:</strong> Rp ${order.total_amount.toLocaleString()}</p>
        <p>Your order is now being processed and will be shipped soon.</p>
        <p>You can track your order status in your account dashboard.</p>
        <p>Best regards,<br>Online Grocery Store Team</p>
      </div>
    `, '#2196F3');
  }

  static generateOrderShippedHTML(order: any, trackingNumber?: string): string {
    const trackingHTML = trackingNumber 
      ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>`
      : '';

    return this.wrapInBaseHTML(`
      <div class="header">
        <h1>Order Shipped</h1>
      </div>
      <div class="content">
        <p>Hello ${order.user.name},</p>
        <p>Great news! Your order <strong>#${order.id}</strong> has been shipped.</p>
        ${trackingHTML}
        <p><strong>Shipping Method:</strong> ${order.shipping_method.name}</p>
        <p><strong>Estimated Delivery:</strong> 2-5 business days</p>
        <p>You can track your order in your account dashboard.</p>
        <p>Best regards,<br>Online Grocery Store Team</p>
      </div>
    `, '#FF9800');
  }

  static generateOrderDeliveredHTML(order: any): string {
    return this.wrapInBaseHTML(`
      <div class="header">
        <h1>Order Delivered</h1>
      </div>
      <div class="content">
        <p>Hello ${order.user.name},</p>
        <p>Your order <strong>#${order.id}</strong> has been delivered successfully!</p>
        <p>We hope you're satisfied with your purchase. If you have any questions or concerns, please don't hesitate to contact our customer service.</p>
        <p>Thank you for shopping with us!</p>
        <p>Best regards,<br>Online Grocery Store Team</p>
      </div>
    `, '#4CAF50');
  }

  static generateOrderCancellationHTML(order: any, reason: string): string {
    return this.wrapInBaseHTML(`
      <div class="header">
        <h1>Order Cancelled</h1>
      </div>
      <div class="content">
        <p>Hello ${order.user.name},</p>
        <p>Your order <strong>#${order.id}</strong> has been cancelled.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If this was a mistake or you have any questions, please contact our customer service.</p>
        <p>We hope to see you again soon!</p>
        <p>Best regards,<br>Online Grocery Store Team</p>
      </div>
    `, '#f44336');
  }

  static generateAdminNotificationHTML(order: any): string {
    const itemsHTML = order.order_items.map((item: any) => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>Rp ${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    return this.wrapInBaseHTML(`
      <div class="header">
        <h1>New Order Received</h1>
        <p class="urgent">Action Required</p>
      </div>
      <div class="content">
        <p>A new order has been placed and requires your attention.</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Store:</strong> ${order.store.name}</p>
        <p><strong>Total Amount:</strong> Rp ${order.total_amount.toLocaleString()}</p>
        
        <h3>Order Items:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <p>Please process this order in the admin dashboard.</p>
        <p>Best regards,<br>Online Grocery Store System</p>
      </div>
    `, '#FF5722', true);
  }

  private static wrapInBaseHTML(content: string, headerColor: string, isAdmin: boolean = false): string {
    const urgentStyle = isAdmin ? '.urgent { color: #FF5722; font-weight: bold; }' : '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${headerColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background: #f2f2f2; }
          .total { font-size: 18px; font-weight: bold; text-align: right; }
          ${urgentStyle}
        </style>
      </head>
      <body>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }
}