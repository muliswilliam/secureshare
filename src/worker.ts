import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

import { sweepExpiredMessages } from './jobs/expire-messages'

const EXPIRE_MESSAGES_QUEUE = 'expire-messages'
const EXPIRE_MESSAGES_SWEEP_CRON = process.env.EXPIRE_MESSAGES_SWEEP_CRON ?? '*/5 * * * *'

const connection = new IORedis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null
})

async function main() {
  const queue = new Queue(EXPIRE_MESSAGES_QUEUE, { connection })

  await queue.upsertJobScheduler(
    'expire-messages-sweep',
    { pattern: EXPIRE_MESSAGES_SWEEP_CRON },
    { name: 'sweep' }
  )

  const worker = new Worker(
    EXPIRE_MESSAGES_QUEUE,
    async () => {
      const result = await sweepExpiredMessages()
      console.log(`[worker] expire-messages sweep: ${result.expiredCount} message(s) expired`)
    },
    { connection }
  )

  worker.on('failed', (job, err) => {
    console.error(`[worker] job ${job?.id} failed:`, err)
  })

  console.log('[worker] started, listening for scheduled expire-messages jobs')
}

main().catch((err) => {
  console.error('[worker] fatal error', err)
  process.exit(1)
})
