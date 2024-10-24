import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LIGHTYEAR_BASE_URL } from "~/contants";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "Chatly | Integrations" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const response = await fetch(
    `${LIGHTYEAR_BASE_URL}/api/v1/envs/${process.env.LIGHTYEAR_ENV}/integrations?managedUserId=${user.id}`,
    {
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const responseData = await response.json();

  return {
    integrations: responseData.map((integration: any) => ({
      id: integration.id,
      name: integration.name,
      title: integration.title,
      description: integration.description,
      authStatus: integration.authStatus,
    })),
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const { integrations } = data;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 mt-16">
        {integrations.map((integration: any) => (
          <a href={`/integrations/${integration.name}`} key={integration.id}>
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  {integration.title}
                  <Badge
                    variant={
                      integration.authStatus === "AUTHORIZED"
                        ? "default"
                        : integration.authStatus === "ERROR"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {integration.authStatus}
                  </Badge>
                </CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>
    </>
  );
}
