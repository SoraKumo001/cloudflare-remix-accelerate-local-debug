import { PrismaClient } from "@prisma/client/edge";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export default function Index() {
  const values = useLoaderData<string[]>();
  return (
    <div>
      {values.map((v) => (
        <div key={v}>{v}</div>
      ))}
    </div>
  );
}

export async function loader({
  context,
}: LoaderFunctionArgs): Promise<string[]> {
  const prisma = new PrismaClient({
    datasourceUrl: context.cloudflare.env.DATABASE_URL,
  });
  await prisma.test.create({ data: {} });
  return prisma.test.findMany({ where: {} }).then((r) => r.map(({ id }) => id));
}
