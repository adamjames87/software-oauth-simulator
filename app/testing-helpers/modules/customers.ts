import {SelectionOf, TestClient} from "~/testing-helpers/test-client";
import {Selector} from "../zeus";
import faker from "@faker-js/faker";
import {salesItemProductSelector} from "~/testing-helpers/modules/sales";


export const customerSelector = Selector("vectric_sales_customers")({
  customerId: true,
  customerName: true,
  email: true,
  customeruuid: true,
  registeredUsername: true,
  verified: true,
  acceptedTerms: true,
  dateAcceptedTerms: true,
  receivingMarketingEmails: true
});
export type CustomerSelection = SelectionOf<"vectric_sales_customers", typeof customerSelector>

const customerSalesSelector = Selector("vectric_sales_customers")({
  customerSales: [
    {},
    {
      orderId: true,
      orderDate: true,
      salesItems: [
        {},
        {
          salesItemProducts: [{}, salesItemProductSelector]
        }
      ]
    }
  ]
})
export type CustomerSalesSelection = SelectionOf<"vectric_sales_customers", typeof customerSalesSelector>


export const emailVerificationSelector = Selector(
  "vectric_security_emailverificationtokens"
)({
  customerId: true,
  token: true,
  username: true,
  expiryDate: true
});
export type EmailVerificationTokenSelection = SelectionOf<"vectric_security_emailverificationtokens",
  typeof emailVerificationSelector>;

/**
 * Customers Module
 * Contains methods for creating
 */
export class Customers {
  constructor(private readonly testClient: TestClient) {
  }

  /**
   * Creates a customer with a random name, and email
   * The customer is created as active
   * @param options
   */
  async createCustomer(options: { verified?: boolean } = {}): Promise<CustomerSelection> {
    const defaults = {
      verified: true
    };
    const variables = {...defaults, ...options};
    const customerName = faker.name.findName();
    return (
      await this.testClient.mutation({
        insertSalesCustomer: [
          {
            object: {
              customerName: customerName,
              email: faker.internet.exampleEmail(),
              registeredUsername: customerName,
              acceptedTerms: true,
              dateAcceptedTerms: new Date(),
              dateUpgradeEmailConsentUpdates: new Date(),
              dateMarketingConsentUpdated: new Date(),
              receivingMarketingEmails: false,
              customerstatusid: 1,
              verified: variables.verified,
              lastLogin: new Date(),
              lastipaddress: faker.internet.ipv4()
            }
          },
          customerSelector
        ]
      })
    ).insertSalesCustomer as CustomerSelection;
  }

  /**
   * Fetch a customer by customerID
   * @param customerId
   */
  async fetchCustomerById(customerId: number): Promise<CustomerSelection> {
    return (await this.testClient.query({
      customerById: [
        {customerId: customerId},
        customerSelector
      ]
    })).customerById as CustomerSelection;
  }

  /**
   * Fetch a customer by email
   * @param email
   */
  async fetchCustomerByEmail(email: string): Promise<CustomerSelection[]> {
    return (await this.testClient.query({
      customers: [
        {where: {email: {_eq: email}}},
        customerSelector
      ]
    })).customers;
  }

  /**
   * Ban the given customer
   * Note: Does not ban orders etc.
   * @param customerId
   */
  async banUser(customerId: number) {
    const bannedStatusId = (
      await this.testClient.query({
        customerStatus: [
          {where: {status: {_eq: "Banned"}}},
          {statusId: true}
        ]
      })
    ).customerStatus[0].statusId;
    await this.testClient.mutation({
      updateCustomerById: [
        {
          pk_columns: {customerId},
          _set: {customerstatusid: bannedStatusId}
        },
        {customerId: true}
      ]
    });
  }


  async createEmailVerificationToken(
    customerId: number,
    email: string
  ): Promise<EmailVerificationTokenSelection> {
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + 30 * 24 * 60 * 60 * 1000);
    const emailVerificationToken = await this.testClient.mutation({
      insertSecurityEmailVerificationToken: [
        {
          object: {
            customerId: customerId,
            username: email,
            expiryDate: expiry,
            token: faker.random.alphaNumeric(12)
          }
        },
        emailVerificationSelector
      ]
    });
    return emailVerificationToken.insertSecurityEmailVerificationToken as EmailVerificationTokenSelection;
  }

  async getEmailVerificationToken(
    customerId: number,
  ): Promise<EmailVerificationTokenSelection> {
    const emailVerificationToken = await this.testClient.query({
      securityEmailVerificationTokens: [
        {
          where: {
            customerId: {_eq: customerId}
          }
        },
        emailVerificationSelector
      ]
    });
    return emailVerificationToken.securityEmailVerificationTokens[0] as EmailVerificationTokenSelection;
  }


  async listAll(): Promise<Array<CustomerSelection & CustomerSalesSelection>> {
    const results = await this.testClient.query({
      customers: [{limit: 20}, {...customerSelector, ...customerSalesSelector}
      ]
    });
    return results.customers;
  }
}
