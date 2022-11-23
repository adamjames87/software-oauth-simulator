import { Chain, GraphQLTypes, InputType } from "./index";

export  function chain() {
  return Chain("http://localhost:8082/v1/graphql", {
    headers: {
      "x-hasura-role": "admin",
      "x-hasura-admin-secret": "totalaccess",
    }
  });
}

export const mutation = chain()("mutation");
export const query = chain()("query");
