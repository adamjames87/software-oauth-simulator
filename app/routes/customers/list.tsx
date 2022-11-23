import {DataFunctionArgs, json} from "@remix-run/node";
import {testingHelpers} from "~/testing-helpers";
import {CustomerSalesSelection, CustomerSelection} from "~/testing-helpers/modules/customers";
import {Link, useLoaderData} from "@remix-run/react";
import {Handle} from "../../components/breadcrumbs";


type LoaderData = {
  customers: Array<CustomerSelection & CustomerSalesSelection>
}
export async function loader({}: DataFunctionArgs) {
  const customers = await testingHelpers.customers.listAll();
  return json<LoaderData>({
    customers
  })
}

type SalesListProps = {
  customer: CustomerSalesSelection
}
function SalesList({customer}: SalesListProps): JSX.Element {

  const productTypes: string[] = [];
  customer.customerSales.map(s => s.salesItems.map(si => {
    si.salesItemProducts.map(sip => {
      productTypes.push(sip.product.productType.productTypeName)
    })
  }))
  return (
    <div>
      {productTypes.join(",")}
    </div>
  )
}


export const handle: Handle = {
  breadcrumbs: () => {
    return [
      {to: `/customers/list`, title: "All Customers"},
    ]
  }
}


export default function ListCustomers() : JSX.Element {
  const {customers} = useLoaderData<LoaderData>();
  return (<div>
      <div className="grid grid-cols-3 space-y-2 ">
        {customers.map(customer => (
          <React.Fragment key={customer.customerId}>
            <div className="border-b border-gray-200">
              <div>{customer.customerName}</div>
              <div className="font-semibold">{customer.email}</div>
            </div>
            <div className="border-b border-gray-200">
              <SalesList customer={customer}/>
            </div>
            <div className="border-b border-gray-200">
              <Link to={`/customers/${customer.customerId}`} className="underline p-2 rounded text-blue-500 text-white">View</Link>
            </div>
          </React.Fragment>
        ))}
      </div>
  </div>)
}
