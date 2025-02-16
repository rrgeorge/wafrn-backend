import { Job, MetricsTime, Worker } from 'bullmq'
import { environment } from '../environment'
import { inboxWorker } from './queueProcessors/inbox'
import { updateUserWorker } from './queueProcessors/updateUser'
import { prepareSendRemotePostWorker } from './queueProcessors/prepareSendRemotePost'
import { sendPostToInboxes } from './queueProcessors/sendPostToInboxes'

console.log('starting workers')
const workerInbox = new Worker('inbox', (job: Job) => inboxWorker(job), {
  connection: environment.bullmqConnection,
  metrics: {
    maxDataPoints: MetricsTime.ONE_WEEK * 2
  },
  concurrency: environment.workers.low
})

const workerUpdateRemoteUsers = new Worker('UpdateUsers', (job: Job) => updateUserWorker(job), {
  connection: environment.bullmqConnection,
  metrics: {
    maxDataPoints: MetricsTime.ONE_WEEK * 2
  },
  concurrency: environment.workers.low
})

const workerPrepareSendPost = new Worker('prepareSendPost', (job: Job) => prepareSendRemotePostWorker(job), {
  connection: environment.bullmqConnection,
  metrics: {
    maxDataPoints: MetricsTime.ONE_WEEK * 2
  },
  concurrency: environment.workers.medium,
  lockDuration: 60000
})

const workerSendPostChunk = new Worker('sendPostToInboxes', (job: Job) => sendPostToInboxes(job), {
  connection: environment.bullmqConnection,
  metrics: {
    maxDataPoints: MetricsTime.ONE_WEEK * 2
  },
  concurrency: environment.workers.high,
  lockDuration: 120000
})

export { workerInbox, workerUpdateRemoteUsers, workerSendPostChunk, workerPrepareSendPost }
