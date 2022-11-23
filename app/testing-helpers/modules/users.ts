import {SelectionOf, TestClient} from "~/testing-helpers/test-client";
import * as bcrypt from "bcrypt";
import {Selector} from "~/testing-helpers/zeus";


const userSelector = Selector("vectric_security_users")({
  username: true,
  password: true,
  enabled: true,
});

export type UserSelection = SelectionOf<"vectric_security_users", typeof userSelector>;



type SecurityGroup = 'Users' | 'Administrators';
function securityGroup(groupName: SecurityGroup) {
  switch (groupName) {
    case "Users":
      return 1
    case "Administrators":
      return 2
  }
}


export const hashPassword = async (rawPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(rawPassword, salt);
};

export const matches = async (rawPassword: string, encodedPassword: string) => {
  return await bcrypt.compare(rawPassword, encodedPassword);
};




/**
 * Class of methods for managing the security users.
 *
 */
export class Users {
  constructor(private readonly testClient: TestClient) {
  }


  /**
   * Adds the user with the same username to the group.
   *
   * @param username - Username of the user
   * @param groupNames - A list of group names. Note: Admins also need to be in
   * the users group
   */
  async addUsersToGroups(username: string, groupNames: SecurityGroup[]) {
    await this.testClient.mutation({
      insertSecurityGroupMembers: [
        {
          objects: groupNames.map(g => {return {username: username, groupId: securityGroup(g)}})
        },
        {
          returning: {
            username: true,
            groupId: true
          }
        }
      ]
    })
  }

  /**
   * Adds the customer as a user, using their email as a username,
   * adding them to the usergroup, and marking them as enabled.
   * @param customerId
   * @param email
   * @param password
   * @returns The user details
   */
  async  addUser(customerId: number, email: string, password: string): Promise<UserSelection> {
    const hashedPassword = await hashPassword(password);
    console.log({password});
    console.log({matches: await matches(password, hashedPassword)});
    const testUsers = await this.testClient.mutation({
      insertSecurityUser: [
        {
          object: {
            salesCustomerId: customerId,
            username: email,
            accountNonExpired: true,
            credentialsNonExpired: true,
            password: hashedPassword,
            enabled: true,
          }
        },
        userSelector
      ]
    })
    await this.addUsersToGroups(email, ["Users"]);
    return testUsers?.insertSecurityUser as UserSelection;
  }




}
