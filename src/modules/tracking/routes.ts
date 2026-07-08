import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

router.post('/visit', async (req, res) => {
  try {
    // Upsert to increment visitor count. Assuming ID 1 is always used.
    await prisma.siteVisitor.upsert({
      where: { id: 1 },
      update: {
        visitors: { increment: 1 }
      },
      create: {
        id: 1,
        visitors: 1
      }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to track visit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
