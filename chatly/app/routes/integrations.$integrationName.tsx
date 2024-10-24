import { Button } from "@/components/ui/button";
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
import { LIGHTYEAR_BASE_URL } from "~/contants";
import { requireUser, requireUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "Chatly | Integration" }];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);

  const { integrationName } = params;

  const response = await fetch(
    `${LIGHTYEAR_BASE_URL}/api/v1/envs/${process.env.LIGHTYEAR_ENV}/integrations/${integrationName}?managedUserId=${userId}`,
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
            <Button type="submit">Authorize</Button>
          </Form>
        )}
        {integration.authStatus === "AUTHORIZED" && (
          <Form method="post" reloadDocument>
            <input type="hidden" name="deauthorize" value="true" />
            <input type="hidden" name="integration" value={integration.name} />
            <Button type="submit" variant={"outline"}>
              Deauthorize
            </Button>
          </Form>
        )}
        {integration.authStatus === "ERROR" && (
          <Form method="post" reloadDocument>
            <input type="hidden" name="authorize" value="true" />
            <input type="hidden" name="integration" value={integration.name} />
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
  const user = await requireUser(request);
  const formData = await request.formData();

  const integrationName = formData.get("integration");

  if (formData.get("authorize")) {
    console.log("authorizing");
    const response = await fetch(
      `${LIGHTYEAR_BASE_URL}/api/v1/envs/${process.env.LIGHTYEAR_ENV}/integrations/${integrationName}/authorize`,
      {
        method: "POST",
        headers: {
          Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managedUserId: user.id.toString(),
          displayName: user.email,
          redirectUrl: request.url,
        }),
      }
    );

    if (response.ok) {
      console.log("received url");
      return await response.json();
    } else {
      const json = await response.json();
      console.log(json);
      console.error(response);
      return { message: "Error" };
    }
  } else if (formData.get("deauthorize")) {
    console.log("deauthorizing");

    const response = await fetch(
      `${LIGHTYEAR_BASE_URL}/api/v1/envs/${process.env.LIGHTYEAR_ENV}/integrations/${integrationName}/deauthorize`,
      {
        method: "POST",
        headers: {
          Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          managedUserId: user.id.toString(),
        }),
      }
    );

    if (response.ok) {
      return { message: "Deauthorized" };
    } else {
      const json = await response.json();
      console.log(json);
      console.error(response);
      return { message: "Error" };
    }
  }

  return null;
};
