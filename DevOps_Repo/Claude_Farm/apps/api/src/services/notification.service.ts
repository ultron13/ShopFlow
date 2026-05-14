import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

const CLICKATELL_API_KEY = process.env.CLICKATELL_API_KEY!;
const CLICKATELL_BASE = 'https://platform.clickatell.com';

type Channel = 'WHATSAPP' | 'SMS' | 'EMAIL';

interface SendOptions {
  userId: string;
  channel: Channel;
  templateId: string;
  payload: Record<string, unknown>;
  to: string;
}

export class NotificationService {
  async send(opts: SendOptions) {
    const notif = await prisma.notification.create({
      data: {
        userId: opts.userId,
        channel: opts.channel,
        templateId: opts.templateId,
        payload: opts.payload,
        status: 'PENDING',
      },
    });

    try {
      if (opts.channel === 'WHATSAPP' || opts.channel === 'SMS') {
        await this.sendClickatell(opts.to, opts.templateId, opts.payload);
      }

      await prisma.notification.update({
        where: { id: notif.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (err) {
      logger.error({ err, notifId: notif.id }, 'Notification send failed');
      await prisma.notification.update({
        where: { id: notif.id },
        data: { status: 'FAILED' },
      });
    }
  }

  private async sendClickatell(to: string, templateId: string, payload: Record<string, unknown>) {
    const res = await fetch(`${CLICKATELL_BASE}/v1/message`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLICKATELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, content: this.renderTemplate(templateId, payload) }),
    });

    if (!res.ok) {
      throw new Error(`Clickatell error: ${res.status}`);
    }
  }

  private renderTemplate(templateId: string, payload: Record<string, unknown>): string {
    const templates: Record<string, (p: Record<string, unknown>) => string> = {
      ORDER_CONFIRMED: (p) =>
        `FarmConnect: Your order of ${p.quantityKg}kg has been confirmed. Delivery on ${p.deliveryDate}. Ref: ${p.orderId}`,
      DELIVERY_DISPATCHED: (p) =>
        `FarmConnect: Your produce is on the way! ETA ${p.eta}. Driver: ${p.driverName} ${p.driverPhone}`,
      PAYMENT_SENT: (p) =>
        `FarmConnect: Payment of R${p.amountRands} has been sent to your account. Ref: ${p.paymentId}`,
      COLLECTION_SCHEDULED: (p) =>
        `FarmConnect: Collection scheduled for ${p.scheduledAt}. Field agent: ${p.agentName}`,
    };

    return templates[templateId]?.(payload) ?? JSON.stringify(payload);
  }
}
