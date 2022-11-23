import {SelectionOf, TestClient} from "~/testing-helpers/test-client";
import {
  order_by,
  Selector,
  vectric_membership_invitation_status_enum,
  vectric_membership_roles_enum,
  vectric_membership_status_enum,
  vectric_organization_types_enum
} from "../zeus";
import faker from "@faker-js/faker";

export const membershipSelector = Selector("vectric_memberships")({
  customerId: true,
  membershipId: true,
  organizationId: true,
  organization: {
    organizationName: true
  },
  role: true,
  status: true,
});
export type MembershipSelection = SelectionOf<"vectric_memberships", typeof membershipSelector>;

export const organizationSelector = Selector("vectric_organizations")({
  organizationId: true,
  organizationName: true,
  organizationUUID: true,
  memberships: [{}, {customerId: true, membershipId: true}]
});
export type OrganizationSelection = SelectionOf<"vectric_organizations", typeof organizationSelector>

export class Organizations {
  constructor(private readonly testClient: TestClient) {
  }

  async createTestOrganization(): Promise<OrganizationSelection> {
    const displayName = `${faker.company.companyName()} - ${faker.random.alphaNumeric(4)}`;
    const result = await this.testClient.mutation({
      insertOrganization: [
        {
          object: {
            active: true,
            createdBy: "Test",
            dateCreated: new Date(),
            type: vectric_organization_types_enum.ORGANIZATION,
            organizationName: displayName,
            countryId: 1
          }
        },
        organizationSelector
      ]
    });
    return result.insertOrganization as OrganizationSelection;
  }

  async getMemberStatus(
    memberId: number,
    organizationId: number
  ) {
    const result = await this.testClient.query({
      memberships: [
        {
          where: {
            _and: [
              {customerId: {_eq: memberId}},
              {organizationId: {_eq: organizationId}}
            ]
          }
        },
        membershipSelector
      ]
    });
    return result.memberships[0] as MembershipSelection;
  }

  getMembershipStatus(status: "ACTIVE" | "PENDING"): vectric_membership_status_enum {
    switch (status) {
      case "ACTIVE":
        return vectric_membership_status_enum.ACTIVE
      case "PENDING" :
        return vectric_membership_status_enum.PENDING
    }
  }

  getMembershipRole(role: "USER" | "ADMIN"): vectric_membership_roles_enum {
    switch (role) {
      case "USER":
        return vectric_membership_roles_enum.USER
      case "ADMIN":
        return vectric_membership_roles_enum.ADMIN;
    }
  }

  getInvitationStatus(status: "ACCEPTED"): vectric_membership_invitation_status_enum {
    switch (status) {
      case "ACCEPTED":
        return vectric_membership_invitation_status_enum.ACCEPTED;
    }
  }


  async addTestMemberToOrganization(
    organizationId: number,
    customerId: number,
    email: string, // of the inviter
    isAdmin: boolean,
    status: "ACTIVE" | "PENDING" = "ACTIVE"
  ): Promise<number> {

    const statusSelection  = {
      "ACTIVE": {
        inviteStatus: vectric_membership_invitation_status_enum.ACCEPTED,
        membershipStatus: vectric_membership_status_enum.ACTIVE
      },
      "PENDING": {
        inviteStatus: vectric_membership_invitation_status_enum.PENDING,
        membershipStatus: vectric_membership_status_enum.PENDING
      }
    };
    const {membershipStatus: membershipStatus, inviteStatus} = statusSelection[status];
    const customer = await this.testClient.customers.fetchCustomerById(customerId)

    const role = await this.getMembershipRole(isAdmin ? "ADMIN" : "USER");
    const membershipId = (await this.testClient.mutation({
      insertOneMembership: [
        {
          object: {
            customerId,
            status: membershipStatus,
            role,
            addedBy: email,
            organizationId,
            email: customer.email
          }
        },
        {
          membershipId: true
        }
      ]
    }))!.insertOneMembership!.membershipId;

    const invite = await this.testClient.mutation({
      insertOneMembershipInvitation: [
        {
          object: {
            organizationId: organizationId,
            membershipId: membershipId,
            invitationStatus: inviteStatus,
            email: customer.email,
            invitedBy: "Test",
            token: faker.random.alphaNumeric(8)
          }
        },
        {
          membershipId: true
        }
      ]
    });
    return membershipId;
  }


  /**
   * Return the first 25 organizations. Sorted by name
   */
  async listAll(): Promise<OrganizationSelection[]> {
    const results = await this.testClient.query({
      organizations: [
        {limit: 100, order_by: [{organizationName: order_by.asc}]},
        organizationSelector
      ]
    });
    return results.organizations;
  }


  /**
   * Find all memberships for a given customer
   * @param customerId
   */
  async allMembershipsForCustomer(customerId: number): Promise<MembershipSelection[]> {
    const results = await this.testClient.query({
      memberships: [
        {
          where: {
            customerId: {_eq: customerId}
          }
        },
        membershipSelector
      ]
    })
    return results.memberships;
  }


}
