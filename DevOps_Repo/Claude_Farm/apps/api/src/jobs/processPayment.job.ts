import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { NotificationService } from '../services/notification.service.js';

const QUEUE_NAME = 'process-payout';

export const payoutQueue = new Queue(QUEUE_NAME, { connection: redis });

const notificationService = new NotificationService();

interface PayoutJobData {
  orderId: string;
  cooperativeId: string;
  amountCents: number;
}

export function startPayoutWorker() {
  const worker = new Worker<PayoutJobData>(
    QUEUE_NAME,
    async (job: Job<PayoutJobData>) => {
      const { orderId, cooperativeId, amountCents } = job.data;
      logger.info({ orderId, cooperativeId }, 'Processing payout');

      const payment = await prisma.payment.create({
        data: {
          orderId,
          cooperativeId,
          type: 'FARMER_PAYOUT',
          amountCents,
          pspProvider: 'STITCH',
          status: 'PROCESSING',
        },
      });

      try {
        const stitchRef = await initiateStitchPayout(cooperativeId, amountCents, payment.id);

        await prisma.payment.update({
          where: { id: payment.id },
          data: { pspReference: stitchRef, status: 'PROCESSING' },
        });

        const cooperative = await prisma.cooperative.findUniqueOrThrow({
          where: { id: cooperativeId },
          include: { user: true },
        });

        await notificationService.send({
          userId: cooperative.userId,
          channel: 'WHATSAPP',
          templateId: 'PAYMENT_SENT',
          payload: { amountRands: (amountCents / 100).toFixed(2), paymentId: payment.id },
          to: cooperative.contactPhone,
        });
      } catch (err) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', failureReason: String(err) },
        });
        throw err;
      }
    },
    { connection: redis, concurrency: 5 },
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Payout job failed');
  });

  return worker;
}

async function initiateStitchPayout(cooperativeId: string, amountCents: number, paymentId: string): Promise<string> {
  const cooperative = await prisma.cooperative.findUniqueOrThrow({ where: { id: cooperativeId } });

  const res = await fetch('https://api.stitch.money/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STITCH_CLIENT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `mutation InitiatePayment($input: InitiatePaymentInput!) {
        clientPaymentInitiation { initiatePayment(input: $input) { id } }
      }`,
      variables: {
        input: {
          amount: { quantity: amountCents / 100, currency: 'ZAR' },
          payerReference: `FC-${paymentId}`,
          beneficiaryReference: `FC-FARM-${cooperativeId}`,
          beneficiaryBankAccount: {
            name: cooperative.name,
            bankId: cooperative.bankBranchCode,
            accountNumber: cooperative.bankAccountNo,
          },
        },
      },
    }),
  });

  const data = await res.json() as { data?: { clientPaymentInitiation?: { initiatePayment?: { id: string } } } };
  const ref = data?.data?.clientPaymentInitiation?.initiatePayment?.id;
  if (!ref) throw new Error('Stitch payout initiation failed');
  return ref;
}
