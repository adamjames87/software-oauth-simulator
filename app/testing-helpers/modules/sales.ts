/**
 * Sales Module
 *
 * Collects methods for creating test sales
 */
import {SelectionOf, TestClient} from "~/testing-helpers/test-client";
import {Selector} from "~/testing-helpers/zeus";
import faker from "@faker-js/faker";

export const salesItemProductSelector = Selector(
  "vectric_sales_salesitem_products"
)({
  salesItemProductId: true,
  productId: true,
  product: {
    type: true,
    productType: {
      productTypeName: true
    }
  },
  licenceCode: true,
  registeredUsername: true,
  status: true,
  salesItemProductStatus: {
    status: true
  }
});
export type SalesItemProductSelection = SelectionOf<"vectric_sales_salesitem_products", typeof salesItemProductSelector>;
export const orderSelector = Selector("vectric_sales_orders")({
  orderId: true,
  salesItems: [
    {},
    {
      salesItemProducts: [{}, salesItemProductSelector]
    }
  ]
});
export type OrderSelection = SelectionOf<"vectric_sales_orders", typeof orderSelector>;

export const trialOrderSelector = Selector("vectric_trial_order")({
  orderId: true,
  customerId: true,
  productId: true,
  valid: true,
  startDate: true,
  endDate: true
});
export type TrialOrderSelection = SelectionOf<"vectric_trial_order",
  typeof trialOrderSelector>;


export class Sales {
  constructor(private readonly testClient: TestClient) {
  }

  SalesItemProductStatus = {
    ACTIVE: 0,
    UPGRADED: 1,
    TRANSFERRED: 2,
    REFUNDED: 3,
    BANNED: 4,
    PENDING: 5, //(1)
    EXPIRED: 6,
    WAITING: 7,
    USED: 8, //(2)
    RELEASE: 9
  }

  async createTestSalesItemProduct(
    customerId: number,
    productId: number
  ): Promise<SalesItemProductSelection> {
    const result = await this.testClient.mutation({
      insertOneOrder: [
        {
          object: {
            customerId: customerId,
            orderId: faker.random.alphaNumeric(30),
            createdBy: "Test",
            dateCreated: new Date(),
            orderDate: new Date(),
            salesItems: {
              data: [
                {
                  productid: productId,
                  salesItemProducts: {
                    data: [
                      {
                        licenceCode: faker.random.alphaNumeric(30),
                        licenceType: "Full Licence",
                        productId: productId,
                        registeredUsername: faker.name.findName(),
                        status: this.SalesItemProductStatus.ACTIVE
                      }
                    ]
                  }
                }
              ]
            }
          }
        },
        orderSelector
      ]
    });
    return result?.insertOneOrder?.salesItems[0]
      ?.salesItemProducts[0] as SalesItemProductSelection;
  }


  async fetchTrialOrdersWithProduct(
    customerId: number,
    productId: number
  ): Promise<TrialOrderSelection[]> {
    const result = await this.testClient.query({
      trialOrders: [
        {
          where: {
            customerId: {_eq: customerId},
            productId: {_eq: productId}
          }
        },
        trialOrderSelector
      ]
    });

    return result.trialOrders;
  }


  async getSalesItemProduct(salesItemProductId: number): Promise<SalesItemProductSelection> {
    const result = await this.testClient.query({
      salesItemProductById: [
        {
          salesItemProductId: salesItemProductId
        },
        salesItemProductSelector
      ]
    });
    return result.salesItemProductById as SalesItemProductSelection;
  }

  /**
   * Fetch all the sales item products for a give customer
   * @param customerId
   */
  async getSalesItemProductsForCustomer(customerId: number): Promise<SalesItemProductSelection[]> {
    const result = await this.testClient.query({
      salesItemProduct: [
        {
          where:
            {
              salesItem: {
                customerSale: {
                  customerId: {
                    _eq: customerId
                  }
                }
              }
            }
        },
        salesItemProductSelector
      ]
    });
    return result.salesItemProduct;
  }

}
