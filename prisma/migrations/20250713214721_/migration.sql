-- DropForeignKey
ALTER TABLE "Api" DROP CONSTRAINT "Api_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_apiId_fkey";

-- AddForeignKey
ALTER TABLE "Api" ADD CONSTRAINT "Api_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE CASCADE ON UPDATE CASCADE;
