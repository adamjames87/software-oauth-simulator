import {Link, RouteMatch} from "@remix-run/react";

export type Handle = {
  breadcrumbs: (m: RouteMatch) => BreadCrumb[]
}


export type BreadCrumb = {
  to: string;
  title: string
}


type props = {
  breadcrumbs: BreadCrumb[]
}
export default function BreadCrumbs({breadcrumbs}: props): JSX.Element {
  return (
    <div className={"flex items-center space-x-4"}>
      <Link  to={"/"} className="underline font-semibold text-gray-500">Home</Link>
      {breadcrumbs.map(bc => (
        <React.Fragment key={bc.to}>
          <div>/</div>
          <div>
            <Link  to={bc.to} className="underline font-semibold text-gray-500">{bc.title}</Link>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
