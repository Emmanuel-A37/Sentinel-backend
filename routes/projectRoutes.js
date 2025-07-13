import express from 'express'
import validateToken from '../middlewares/authMiddleware.js'
import { getProjects, createProject, deleteProject } from '../controllers/projectControllers.js';


const router = express.Router();

router.get('/', validateToken, getProjects);

router.post('/', validateToken, createProject);



router.delete('/:id', validateToken, deleteProject);

export default router;