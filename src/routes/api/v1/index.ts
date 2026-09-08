import { Router } from 'express';
import { urlRouter } from './url.routes';

const router = Router();

// Mount domain routes
// All routes in urlRouter will be prefixed with /urls (e.g. /api/v1/urls/shorten)
router.use('/urls', urlRouter);

export { router as v1Router };
