import { Button } from "@/components/ui/button";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { requireUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const { integrationName } = params;

  const response = await fetch(
    `http://localhost:3000/api/v1/envs/dev/integrations/${integrationName}/managed-users/${userId}`,
    {
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const responseData = await response.json();

  return {
    integration: {
      id: responseData.id,
      name: responseData.name,
      title: responseData.title,
      description: responseData.description,
      authStatus: responseData.authStatus,
      app: responseData.app,
      customApp: responseData.customApp,
    },
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();

  const { integration } = data;

  useEffect(() => {
    if (actionData?.authRequestUrl) {
      window.location.href = actionData.authRequestUrl;
    }
  }, [actionData?.authRequestUrl]);

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-1">{integration.title}</h1>
      <p className="text-base text-muted-foreground">
        {integration.description}
      </p>
      <div className="mt-8">
        {integration.authStatus === "UNAUTHORIZED" && (
          <Form method="post" reloadDocument>
            <input type="hidden" name="authorize" value="true" />
            <input type="hidden" name="integration" value={integration.name} />
            <input
              type="hidden"
              name="customApp"
              value={integration.customApp}
            />
            <Button type="submit">Authorize</Button>
          </Form>
        )}
        {integration.authStatus === "AUTHORIZED" && (
          <Form method="post" reloadDocument>
            <input type="hidden" name="deauthorize" value="true" />
            <input type="hidden" name="integration" value={integration.name} />
            <input
              type="hidden"
              name="customApp"
              value={integration.customApp}
            />
            <Button type="submit" variant={"outline"}>
              Deauthorize
            </Button>
          </Form>
        )}
        {integration.authStatus === "ERROR" && (
          <Form method="post" reloadDocument>
            <input type="hidden" name="authorize" value="true" />
            <input type="hidden" name="integration" value={integration.name} />
            <input
              type="hidden"
              name="customApp"
              value={integration.customApp}
            />
            <Button type="submit" variant={"destructive"}>
              Reauthorize
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const integrationName = formData.get("integration");

  if (formData.get("authorize")) {
    const response = await fetch(
      `http://localhost:3000/api/v1/envs/dev/integrations/${integrationName}/managed-users/${userId}/authorize`,
      {
        method: "POST",
        headers: {
          Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirectUrl: request.url,
        }),
      }
    );

    return await response.json();
  } else if (formData.get("deauthorize")) {
    const response = await fetch(
      `http://localhost:3000/api/v1/envs/dev/integrations/${integrationName}/managed-users/${userId}/deauthorize`,
      {
        method: "POST",
        headers: {
          Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
        },
      }
    );
  }
  return null;
};
