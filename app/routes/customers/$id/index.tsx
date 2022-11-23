import {Form, useFetcher, useLoaderData, useSearchParams} from "@remix-run/react";
import {DataFunctionArgs, json} from "@remix-run/node";
import {CustomerSelection} from "~/testing-helpers/modules/customers";
import {testingHelpers} from "~/testing-helpers";
import {SalesItemProductSelection} from "~/testing-helpers/modules/sales";
import {MembershipSelection, OrganizationSelection} from "~/testing-helpers/modules/organizations";
import {Handle} from "~/components/breadcrumbs";
import {getToken} from "~/utils/tokenStore.server";

type LoaderData = {
  customer: CustomerSelection,
  sales: SalesItemProductSelection[],
  allOrganizations: OrganizationSelection[],
  memberships: MembershipSelection[],
  accessToken?: string,
  password?: string | null
}

export async function loader({request, params}: DataFunctionArgs) {
  const url = new URL(request.url)
  const password = url.searchParams.get("password");
  const customerId = parseInt(params.id as string);
  const allOrganizations = await testingHelpers.organizations.listAll();
  const memberships = await testingHelpers.organizations.allMembershipsForCustomer(customerId);
  const token = getToken(customerId);
  console.log("token", token)
  return json<LoaderData>({
    customer: await testingHelpers.customers.fetchCustomerById(customerId),
    sales: await testingHelpers.sales.getSalesItemProductsForCustomer(customerId),
    allOrganizations: allOrganizations.filter(org => memberships.findIndex(m => m.organizationId === org.organizationId) < 0),
    memberships: memberships,
    accessToken: token,
    password: password
  })
}


function buildLoginUrl(productType: string, customerId: number) {
  const authUrl = new URL("http://localhost:8080/oauth/authorize")
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", productType);
  authUrl.searchParams.set("redirect_uri", `http://localhost:5050/customers/${customerId}/runTests`);
  authUrl.searchParams.set("scope", "licence+freeclipart+tooldb")
  return authUrl
}


function colourFromType(productType: string): string {
  switch (productType) {
    case "Aspire":
      return "bg-aspire"
    case "VCarve Pro":
      return "bg-vcarvePro"
    case "VCarve Desktop":
      return "bg-vcarveDesktop"
    case "Cut2D Pro":
      return "bg-cut2dPro"
    case "Cut2D Desktop":
      return "bg-cut2dDesktop"
    default:
      return "bg-vgrey-400"
  }
}

type SalesItemProductProductBlockProps = {
  salesItemProduct: SalesItemProductSelection,
  customer: CustomerSelection
}

function SalesItemProductBlock({salesItemProduct, customer}: SalesItemProductProductBlockProps): JSX.Element {
  const bgColour = `${colourFromType(salesItemProduct.product.productType.productTypeName)}`
  return (<div className={"text-white rounded p-2" + " " + bgColour}>
    <div className="flex flex-row space-x-2 items-center">
      <div className="flex-1">{salesItemProduct.product.productType.productTypeName}</div>
      <a className="flex-0 p-2 border-white border rounded"
         href={buildLoginUrl(salesItemProduct.product.productType.productTypeName, customer.customerId).href}>Login with
        this Product
      </a>
    </div>
  </div>)
}


type SaleListProps = {
  sales: SalesItemProductSelection[],
  customer: CustomerSelection
}

function SaleList({sales, customer}: SaleListProps): JSX.Element {
  return (<div>
    {(sales.length > 0) && (
      <div className="space-y-2">
        {sales.map(sip => (
          <SalesItemProductBlock salesItemProduct={sip} customer={customer} key={sip.salesItemProductId}/>
        ))}
      </div>
    )}
  </div>)
}

export const handle: Handle = {
  breadcrumbs: ({params}) => {
    const customerId = params.id
    return [
      {to: `/customers/list`, title: "All Customers"},
      {to: `/customers/${customerId}`, title: `${customerId}`}
    ]
  }
}


type AddtoOrganizationFormProps = {
  customer: CustomerSelection,
  allOrganizations: OrganizationSelection[]
}

export function AddToOrganizationForm({customer, allOrganizations}: AddtoOrganizationFormProps): JSX.Element {
  const organizationFetcher = useFetcher()
  const isSubmitting = organizationFetcher.state === "submitting";
  return (
    <div className="bg-gray-50 border border-gray-200 p-2 rounded">
      <div className="flex items-center mt-4">
        <h3 className="font-semibold flex-1">Add to Organization</h3>
        {isSubmitting && (
          <div className={"px-6 text-gray-400"}>Saving...</div>
        )}
      </div>
      <organizationFetcher.Form action="/organizations/new" method="post">
        <fieldset disabled={isSubmitting}>
          <input type="hidden" value={customer.customerId} name="customerId"/>
          <div className="relative flex items-start my-4">
            <div className="flex items-center h-5">
              <input id="isAdmin" aria-describedby="admin-description" name="isAdmin" type="checkbox"
                     className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isAdmin" className="font-medium text-gray-700">Add as Admin</label>
              <p id="admin-description" className="text-gray-500">
                If unchecked customer will be added as user
              </p>
            </div>
          </div>

          <div className="relative flex items-start my-4">
            <div className="flex items-center h-5">
              <input id="inviteOnly" aria-describedby="pending-description" name="inviteOnly" type="checkbox"
                     className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="" className="font-medium text-gray-700">Pending Only</label>
              <p id="pending-description" className="text-gray-500">
                If checked customer will just be pending
              </p>
            </div>
          </div>


          <div className="flex items-center">
            <div className="flex flex-1 items-center">
              <select className="flex-1 rounded border border-gray-200" name={"organizationId"}>
                {allOrganizations.map(org => (
                  <option value={org.organizationId}>{org.organizationName}</option>
                ))}
              </select>
              <button type="submit" name="createNew" value="false"
                      className={"px-4 bg-gray-700 text-white py-2 rounded ml-2"}>Add
              </button>
            </div>
            <div className="mx-4 underline">
              or
            </div>
            <div>
              <button type="submit" name="createNew" value="true"
                      className={"px-4 bg-gray-700 text-white py-2 rounded"}>Create New
              </button>
            </div>
          </div>
        </fieldset>
      </organizationFetcher.Form>
    </div>
  )
}


export default function Customer(): JSX.Element {
  const params = useSearchParams()
  const {customer, password, sales, allOrganizations, memberships, accessToken} = useLoaderData<LoaderData>()
  const copyEmailAddress = async () => {
    await navigator.clipboard.writeText(customer.email);
  }
  return (
    <div className="mt-4">

      <div className="grid grid-cols-2 space-x-6">
        <div className="space-y-4">
          <div className="border border-gray-200 bg-gray-50 text-gray-800 rounded p-2">
            <div className="break-all font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200">
              <pre>
              {JSON.stringify(customer, null, 2)}
              </pre>
            </div>
          </div>
          <div>
            <div className="cursor-pointer bg-blue-500 px-4 py-2 text-white rounded inline mt-8"
                 onClick={copyEmailAddress}
            >Copy Email Address
            </div>
          </div>
          {accessToken && (<div>
            <h3 className="font-semibold">Token</h3>
            <div className="break-all font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200">
              {accessToken}
            </div>

            <a className="" href={`/customers/${customer.customerId}/runTests`} >

              Run Tests
            </a>
          </div>)}
          <SaleList sales={sales} customer={customer}/>
          <div className="border border-vgrey-300 rounded p-2 shadow">
            <span className="font-semibold py-2">Add Order</span>
            <Form action="/orders/create" method="post">
              <input type="hidden" name="customerId" value={customer.customerId}/>
              <select name="product" id="product" className="rounded mt-2 border-gray-300">
                <option value="Aspire V11">Aspire V11</option>
                <option value="VCarve Pro V11">VCarve Pro V11</option>
                <option value="VCarve Desktop V11">VCarve Desktop V11</option>
                <option value="Cut2D Pro V11">Cut2D Pro</option>
                <option value="Cut2D Desktop V11">Cut2D Desktop</option>
              </select>
              <button type="submit" className="bg-blue-500 text-white rounded p-2 px-4 ml-2">Add Sale</button>
            </Form>
          </div>
        </div>
        <div>
          {password && (
            <div className="rounded bg-green-50 border border-green-500 text-green-500 p-4">
              A user was created with the following credentials.
              <div className="grid grid-cols-2 space-y-1 mt-2">
                <span className="font-semibold">Username</span>
                <span>{customer.email}</span>
                <span className="font-semibold">Password</span>
                <span>{password}</span>
              </div>
            </div>
          )}
          <div>
            <h3 className="font-semibold my-4">Organization Memberships</h3>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
              <tr>
                <th scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                {/*<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">*/}
                {/*  <span className="sr-only">Edit</span>*/}
                {/*</th>*/}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
              {memberships.map(membership => (
                <tr key={membership.membershipId}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {membership.organization.organizationName}
                  </td>
                  <td
                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{membership.role}</td>
                  {/*<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">*/}
                  {/*  <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit<span className="sr-only">, Lindsay Walton</span></a>*/}
                  {/*</td>*/}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="h-12"></div>
          <AddToOrganizationForm customer={customer} allOrganizations={allOrganizations}/>
        </div>
        <pre>
      </pre>
      </div>
    </div>
  )

}
