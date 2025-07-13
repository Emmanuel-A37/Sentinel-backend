import express from 'express'
import { trackRequest } from '../controllers/trackController.js';


const router = express.Router();

router.post('/', trackRequest);

export default router;