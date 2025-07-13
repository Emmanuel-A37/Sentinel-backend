import prisma from "../db/prisma.js";

export const createApi = async (req,res) => {
    const projectId = req.params.projectId;
    const {method, path} = req.body;
    try {
        const api = await prisma.api.create({
            data : {
                method : method.toUpperCase(),
                path,
                projectId,
            },
        });
        return res.status(201).json(api);
    } catch (error) {
        res.status(400).json({error : error.message});
    }
}

export const getProjectApis = async (req, res) => {
    const id = req.params.projectId;

    try {
        // Fetch project along with its APIs and requests
        const project = await prisma.project.findUnique({
            where: { id },
            select: {
                name: true,
                environment: true,
                apis: {
                    include: {
                        _count: { select: { requests: true } },
                        requests: { select: { responseTime: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const enrichedApis = project.apis.map(api => {
            const totalRequests = api.requests.length;
            const avgResponseTime = totalRequests === 0
                ? 0
                : api.requests.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;

            return {
                id: api.id,
                method: api.method,
                path: api.path,
                totalRequests,
                avgResponseTime: Number(avgResponseTime.toFixed(2))
            };
        });

        const totalRequests = project.apis.reduce((sum, api) => sum + api.requests.length, 0);
        const allRequests = project.apis.flatMap(api => api.requests);

        const overallAvgResponseTime = allRequests.length === 0
            ? 0
            : allRequests.reduce((sum, r) => sum + r.responseTime, 0) / allRequests.length;

        return res.status(200).json({
            name: project.name,
            environment: project.environment,
            overallAvgResponseTime: Number(overallAvgResponseTime.toFixed(2)),
            totalRequests,
            totalApis: project.apis.length,
            apis: enrichedApis
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




export const deleteApi = async (req,res) => {
    const id = req.params.id;
    try {
        const api = await prisma.api.delete({
            where : {
                id
            },
        });
        return res.status(201).json("API deleted successfully");
    } catch (error) {
        res.status(400).json({error : error.message});
    }
}
export const getApi = async (req, res) => {
  const id = req.params.id;
  const pageNumber = parseInt(req.query.page || '1');
  const pageSize = 10;
  const skipAmount = (pageNumber - 1) * pageSize;

  try {

    const totalRequests = await prisma.request.count({
      where: { apiId: id },
    });

    const api = await prisma.api.findUnique({
      where: { id },
      select: {
        id: true,
        method: true,
        path: true,
        requests: {
          orderBy: { createdAt: 'desc' },
          skip: skipAmount,
          take: pageSize,
          select: {
            statusCode: true,
            responseTime: true,
            createdAt: true,
          },
        },
      },
    });

    if (!api) return res.status(404).json({ message: "API not found" });

    const totalPages = Math.ceil(totalRequests / pageSize);

    return res.status(200).json({
      ...api,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalRequests,
        totalPages,
        isFirstPage: pageNumber === 1,
        isLastPage: pageNumber >= totalPages,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const getApiStats = async (req, res) => {
  const apiId = req.params.id;

  try {
    const requests = await prisma.request.findMany({
      where: {
        apiId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        responseTime: true,
        statusCode: true,
        createdAt: true,
      },
    });

    if (!requests.length) {
      return res.status(404).json({ error: 'No request data found for this API.' });
    }


    const totalResponseTime = requests.reduce((sum, r) => sum + r.responseTime, 0);
    const avgResponseTime = parseFloat((totalResponseTime / requests.length).toFixed(2));


    const responseTimeOverTime = requests.map((r) => ({
      time: r.createdAt,
      responseTime: r.responseTime,
    }));

   
    const statusCodeCounts = {};
    requests.forEach((r) => {
      statusCodeCounts[r.statusCode] = (statusCodeCounts[r.statusCode] || 0) + 1;
    });

    

    return res.json({
      avgResponseTime,
      responseTimeOverTime,
      statusCodeCounts,
      totalRequests: requests.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

