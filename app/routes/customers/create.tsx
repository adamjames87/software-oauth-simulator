import {Form} from "@remix-run/react";
import {redirect} from "@remix-run/node";
import {testingHelpers} from "~/testing-helpers";
import faker from "@faker-js/faker";

export async function action() {
  console.log("Submitting action")
  const customer = await testingHelpers.customers.createCustomer();

  const password = "LetMeIn"
  const user = await testingHelpers.users.addUser(customer.customerId,customer.email, password);

  const url = `/customers/${customer.customerId}?password=${password}`;
  return redirect(url)
}


export default function CreateCustomer(): JSX.Element {
  return (
    <div>
      <p className="w-2/3 my-4">
        This will create a new test customer. The customer will also be created as a V&Co user.
        The password and email will be shown upon creation
      </p>
      <Form action="/customers/create" method="post">
        <button className="bg-blue-500 text-white py-2 px-6 rounded" type="submit">Create Customer</button>
      </Form>
    </div>
  )
}
