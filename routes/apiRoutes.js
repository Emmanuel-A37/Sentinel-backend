import validateToken from "../middlewares/authMiddleware.js";
import express from 'express'
import { createApi, deleteApi, getProjectApis, getApi, getApiStats } from "../controllers/apiControllers.js";


const router = express.Router();

router.post('/:projectId', validateToken, createApi);
router.get('/:projectId', validateToken, getProjectApis);
router.delete('/:id', validateToken, deleteApi);
router.get('/api/:id', validateToken, getApi);
router.get('/api/:id/stats', validateToken, getApiStats);

export default router;