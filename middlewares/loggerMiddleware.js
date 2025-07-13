import prisma from '../db/prisma.js';

export const apiLogger = () => {
  return async (req, res, next) => {
    const start = performance.now();

    const apiKey = req.headers['x-api-key']; 
    const method = req.method;
    const path = req.baseUrl + req.path;


    const project = await prisma.project.findFirst({ where: { apiKey } });
    if (!project) return res.status(401).json({ message: 'Invalid API Key' });


    const api = await prisma.api.findFirst({
      where: {
        method,
        path,
        projectId: project.id,
      },
    });

    if (!api) return res.status(404).json({ message: 'API not registered' });

    // Intercept response to log once finished
    const originalSend = res.send;
    res.send = async function (body) {
      const duration = performance.now() - start;

      await prisma.request.create({
        data: {
          apiId: api.id,
          statusCode: res.statusCode,
          responseTime: Number(duration.toFixed(2)),
        },
      });

      originalSend.call(this, body);
    };

    next();
  };
};
