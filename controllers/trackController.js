import prisma from '../db/prisma.js';


const matchDynamicPath = (loggedPath, registeredPath) => {
  const toSegments = (p) => p.split('/').filter(Boolean);
  const loggedSegments = toSegments(loggedPath);
  const registeredSegments = toSegments(registeredPath);

  if (loggedSegments.length !== registeredSegments.length) return false;

  return registeredSegments.every((seg, i) =>
    seg.startsWith(':') || seg === loggedSegments[i]
  );
};

export const trackRequest = async (req, res) => {
  try {
    const { path, method, statusCode, responseTime } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) return res.status(401).json({ message: 'API key missing' });

    const project = await prisma.project.findUnique({ where: { apiKey } });
    if (!project) return res.status(403).json({ message: 'Invalid API key' });

    const apis = await prisma.api.findMany({
      where: {
        method: method.toUpperCase(),
        projectId: project.id,
      },
    });

    const matchedApi = apis.find((api) => matchDynamicPath(path, api.path));

    if (!matchedApi) {
      return res.status(404).json({ message: 'API not registered' });
    }

    await prisma.request.create({
      data: {
        apiId: matchedApi.id,
        statusCode: Number(statusCode),
        responseTime: Number(responseTime),
      },
    });
    // Emit real-time update to connected frontend clients
    
    const io = req.app.get('io');
    io.emit('request-logged', {
      apiId: matchedApi.id,
      method,
      path,
      statusCode,
      responseTime,
      createdAt: new Date().toISOString()
    });    

    res.status(201).json({ message: 'Request logged' });
  } catch (error) {
    console.error('Track error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
