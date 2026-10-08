import { PrismaClient } from '@prisma/client';
import { ETHICS_STANDARDS, MANDATE_ARTICLES, STRATEGIC_PILLARS } from '../src/lib/governance-page-defaults';

const prisma = new PrismaClient();

async function main() {
  const sections = [
    {
      key: 'strategic',
      rows: STRATEGIC_PILLARS.map((item, index) => ({ id: `default-strategic-${index}`, section: 'strategic', number: item.num, title: item.title, body: item.desc, metric: item.metric, sortOrder: index })),
    },
    {
      key: 'mandate',
      rows: MANDATE_ARTICLES.map((item, index) => ({ id: `default-mandate-${index}`, section: 'mandate', number: item.num, title: item.title, body: item.body, tags: item.tags.join('\n'), sortOrder: index })),
    },
    {
      key: 'ethics',
      rows: ETHICS_STANDARDS.map((item, index) => ({ id: `default-ethics-${index}`, section: 'ethics', title: item.title, body: item.body, iconKey: item.iconKey, sortOrder: index })),
    },
  ];
  for (const section of sections) {
    const count = await prisma.governancePageCard.count({ where: { section: section.key } });
    if (count === 0) {
      const result = await prisma.governancePageCard.createMany({ data: section.rows, skipDuplicates: true });
      process.stdout.write(`${section.key}: seeded ${result.count} original cards\n`);
    } else {
      process.stdout.write(`${section.key}: kept ${count} existing cards\n`);
    }
  }
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
