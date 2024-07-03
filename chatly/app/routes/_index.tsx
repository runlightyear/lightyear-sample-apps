import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Chatly | Instant message your website visitors" }];
};

export default function Index() {
  return (
    <div className={"py-16 flex flex-col justify-center items-center h-full"}>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center">
        Chatly
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6 text-center text-gray-500">
        Instant message your website visitors
      </p>
      <div className={"mt-12 flex justify-center"}>
        <Button asChild>
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </div>
  );
}
