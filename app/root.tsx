import type {LinksFunction, MetaFunction} from "@remix-run/node";
import tailwindStylesheetUrl from "./styles/tailwind.css";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration, useMatches,
} from "@remix-run/react";
import BreadCrumbs, {BreadCrumb} from "~/components/breadcrumbs";


export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};


export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  const matches = useMatches();
  const breadcrumbs : BreadCrumb[] = matches.filter(m => m.handle && m.handle.breadcrumbs).map(m => m!.handle!.breadcrumbs(m)).flat();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
      <div className="container mx-auto py-6">
        <div className="flex flex-row py-2">
          <div className="flex-1">
            <h1 className="font-semibold text-2xl">Oauth Simulator</h1>
          </div>
          <div className="flex-0">
          </div>
        </div>
        <div className="pb-10">
          <BreadCrumbs breadcrumbs={breadcrumbs} />
        </div>
        <Outlet />
      </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
