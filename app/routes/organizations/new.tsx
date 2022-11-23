import {DataFunctionArgs, redirect} from "@remix-run/node";
import {zfd} from "zod-form-data";
import * as z from "zod";
import {testingHelpers} from "~/testing-helpers";

function isTrueFalseString(t: string): boolean {
  return t.toLowerCase() === "true" || t.toLowerCase() === "false";
}
function toBoolean(t: string) {
  if (t.toLowerCase() === "true") {
    return true;
  } else {
    return false
  }
}

const schema = zfd.formData({
  createNew: z.string().refine(isTrueFalseString).transform(toBoolean),
  inviteOnly: zfd.checkbox(),
  customerId: z.string().transform(t => parseInt(t)),
  organizationId: zfd.numeric(z.number().int().optional()),
  isAdmin: zfd.checkbox()
})

export async function action({request}: DataFunctionArgs) {
  const formData = await request.formData();
  const data = schema.parse(formData);
  let organizationId = data.organizationId;

  if (data.createNew || !organizationId) {
    const organization = await testingHelpers.organizations.createTestOrganization();
    organizationId = organization.organizationId;
  }

  await testingHelpers.organizations.addTestMemberToOrganization(organizationId,
    data.customerId, "test@vectric.com", data.isAdmin,
    data.inviteOnly ? "PENDING" : "ACTIVE");

  return redirect(`/customers/${data.customerId}`)
}
