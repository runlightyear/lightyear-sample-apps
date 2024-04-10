import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  redirect,
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

  console.log("integrationName", integrationName);

  const response = await fetch(
    `http://localhost:3000/api/v1/envs/dev/integrations/${integrationName}/managed-users/${userId}`,
    {
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const responseData = await response.json();

  console.log("responseData", responseData);

  // const accessKeyResponse = await fetch(
  //   `http://localhost:3000/api/v1/envs/dev/custom-apps/hubspot/managed-users/${userId}/data`,
  //   {
  //     headers: {
  //       Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
  //     },
  //   }
  // );

  // const accessKeyResponseData = await accessKeyResponse.json();
  // console.log("accessKeyResponseData", accessKeyResponseData);

  return { integration: responseData };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  console.log("formData");
  for (const entry of formData.entries()) {
    console.log(entry);
  }

  const customAppName = formData.get("customApp");
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

    const responseData = await response.json();
    console.log("responseData", responseData);
    return responseData;
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
  } else if (formData.get("enable")) {
    const response = await fetch(
      `http://localhost:3000/api/v1/envs/dev/integrations/${integrationName}/managed-users/${userId}/enable`,
      {
        method: "POST",
        headers: {
          Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
        },
      }
    );
    const responseData = await response.json();
    console.log("responseData", responseData);
  } else if (formData.get("disable")) {
    const response = await fetch(
      `http://localhost:3000/api/v1/envs/dev/integrations/${integrationName}/managed-users/${userId}/disable`,
      {
        method: "POST",
        headers: {
          Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
        },
      }
    );
    const responseData = await response.json();
    console.log("responseData", responseData);
  }
  return null;
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();

  const { integration } = data;

  console.log("integration", integration);

  useEffect(() => {
    if (actionData?.authRequestUrl) {
      window.location.href = actionData.authRequestUrl;
    }
  }, [actionData?.authRequestUrl]);

  const handleCheckedChange = async (newValue: boolean) => {
    console.log("handleCheckedChange", newValue);

    fetcher.submit(
      {
        integration: integration.name,
        ...(newValue === true ? { enable: true } : { disable: true }),
      },
      {
        method: "POST",
      }
    );
  };

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
      </div>
    </div>
  );
}
