import { Router } from 'express';
import {
  shortenUrlController,
  resolveUrlController,
} from '@/controllers/url.controller';

const router = Router();

// Route: GET /api/v1/urls/shorten?url=https://...
router.get('/shorten', shortenUrlController);

// Route: GET /api/v1/urls/:code
router.get('/:code', resolveUrlController);

export { router as urlRouter };
