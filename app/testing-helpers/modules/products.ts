import {SelectionOf, TestClient} from "~/testing-helpers/test-client";
import {Selector} from "~/testing-helpers/zeus";

const productTypeSelector = Selector("vectric_products_producttype")({
  productTypeId: true,
  productTypeName: true
});

const productSelector = Selector("vectric_products_products")({
  productID: true,
  productName: true,
  productType: productTypeSelector,
  latestVersion: {
    majorVersion: true,
    minorVersionXOO: true
  }

});
export type ProductSelection = SelectionOf<"vectric_products_products",
  typeof productSelector>;

/**
 * Products module
 *
 * Collection of methods for fetching and editing products
 */
export class Products {
  constructor(private readonly testClient: TestClient) {
  }

  async getProductByName(
    productName: string
  ): Promise<{ productId: number } & ProductSelection> {
    const productQuery = await this.testClient.query({
      products: [
        {
          where: {
            productName: {_eq: productName}
          }
        },
        productSelector
      ]
    });
    return productQuery.products.map(p => {
      return {productId: p.productID, ...p};
    })[0];

  }
}


