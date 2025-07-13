import prisma  from '../db/prisma.js'
import crypto from 'crypto'

export const createProject = async (req, res) => {
    try {
        const { name, environment } = req.body;
        const project = await prisma.project.create({
            data : {
                name,
                environment: environment || "production",
                userId : req.userId,
                apiKey : crypto.randomUUID(),
            },
        });
        return res.status(201).json(project);
    } catch (error) {
        res.status(400).json({error : error.message});
    }
}


export const getProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.userId },
            include: {
                _count: {
                select: { apis: true }
                },
                apis: {
                select: {
                    id: true,
                    requests: {
                    select: {
                        responseTime: true
                    }
                    }
                }
                }
            }
            });
            const enrichedProjects = projects.map(project => {
                const allRequests = project.apis.flatMap(api => api.requests);
                const totalRequests = allRequests.length;
                const avgResponseTime = totalRequests === 0 ? 0 : 
                    allRequests.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;

                return {
                    id: project.id,
                    name: project.name,
                    environment: project.environment,
                    apiKey: project.apiKey,
                    apiCount: project._count.apis,
                    totalRequests,
                    avgResponseTime: Number(avgResponseTime.toFixed(2))
                };
            });


         return res.status(200).json(enrichedProjects);
    } catch (error) {
        res.status(400).json({error : error.message});
    }

}



export const deleteProject = async (req, res) => {
    const id  = req.params.id;
    try {
        const project = await prisma.project.delete({
            where : {id},
        });
         return res.status(200).json({message : "Deleted successfully"});
    } catch (error) {
        res.status(400).json({error : error.message});
    }
}