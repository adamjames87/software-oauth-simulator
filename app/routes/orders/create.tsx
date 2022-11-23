import {DataFunctionArgs, redirect} from "@remix-run/node";
import {testingHelpers} from "~/testing-helpers";

export async function action({request, params}: DataFunctionArgs) {
  console.log("Action called")
  const formData = await request.formData();
  console.log(JSON.stringify(formData, null, 2));
  const customerId = formData.get("customerId");
  const productName = formData.get("product")
  const product = await testingHelpers.products.getProductByName(productName as string);
  await testingHelpers.sales.createTestSalesItemProduct(parseInt(customerId), product.productId);
  return redirect(`/customers/${customerId}`)
}
