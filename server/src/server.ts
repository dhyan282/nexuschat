import { server } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

async function main() {
  await connectDB();
  server.listen(env.PORT, () => logger.info(`Server running on port ${env.PORT}`));
}
main();
