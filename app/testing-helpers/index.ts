import {TestClient} from "~/testing-helpers/test-client";

export const testingHelpers = new TestClient("http://localhost:8082/v1/graphql", {
  headers: {
    "x-hasura-role": "admin",
    "x-hasura-admin-secret": "totalaccess",
  }
})
