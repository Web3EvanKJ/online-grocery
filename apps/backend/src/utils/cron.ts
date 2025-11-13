import cron from 'node-cron';
import { AutoCancellationService } from '../services/auto-cancellation.service';

export function setupCronJobs() {
  // Run every hour to check for unpaid orders
  cron.schedule('0 * * * *', async () => {
    console.log('Running auto-cancellation job...');
    await AutoCancellationService.cancelUnpaidOrders();
  });

  // Run every day at 8 AM for other maintenance tasks
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily maintenance jobs...');
    // Bisa tambain other jobs di sini
  });

  console.log('Cron jobs initialized');
}