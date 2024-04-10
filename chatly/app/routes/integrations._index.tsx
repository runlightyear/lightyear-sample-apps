import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { TopNav } from "~/components/TopNav";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const response = await fetch(
    `http://localhost:3000/api/v1/envs/dev/integrations/managed-users/${user.id}`,
    {
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const responseData = await response.json();

  console.log("responseData", responseData);

  return { integrations: responseData };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();

  const { integrations } = data;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 mt-16">
        {integrations.map((integration) => (
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
