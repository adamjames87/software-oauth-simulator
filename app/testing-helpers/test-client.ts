import {Chain, chainOptions, GenericOperation, OperationOptions, ValueTypes} from "./zeus";
import {GraphQLTypes, InputType} from "~/testing-helpers/zeus";
import {Users} from "./modules/users";
import {Customers} from "~/testing-helpers/modules/customers";
import {Sales} from "~/testing-helpers/modules/sales";
import {Products} from "~/testing-helpers/modules/products";
import {Organizations} from "~/testing-helpers/modules/organizations";

export type SelectionOf<T extends keyof GraphQLTypes, V> = InputType<GraphQLTypes[T], V>

/**
 * The test client.
 *
 * This just wraps up all the test methods into a helpful
 * discoverable interface
 */
export class TestClient {

  // Helpers for executing queries & mutations
  query: <Z extends ValueTypes[GenericOperation<"query">]>(o: (ValueTypes[GenericOperation<"query">] | Z), ops?: OperationOptions) => Promise<InputType<GraphQLTypes[GenericOperation<"query">], Z>>;
  mutation: <Z extends ValueTypes[GenericOperation<"mutation">]>(o: (ValueTypes[GenericOperation<"mutation">] | Z), ops?: OperationOptions) => Promise<InputType<GraphQLTypes[GenericOperation<"mutation">], Z>>;

  //
  // Modules of functionality
  //
  users: Users;
  customers: Customers;
  sales: Sales;
  products: Products;
  organizations: Organizations;


  constructor(...zeusChainOptions: chainOptions) {
    const chain = Chain(...zeusChainOptions)
    this.query = chain("query")
    this.mutation = chain("mutation")

    this.users = new Users(this);
    this.customers = new Customers(this);
    this.sales = new Sales(this);
    this.products = new Products(this);
    this.organizations = new Organizations(this)
  }


}
