export enum Role1 {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  TECHNICAL_DIRECTOR = 'TECHNICAL_DIRECTOR',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  MANAGEMENT_CONTROLLER = 'MANAGEMENT_CONTROLLER',
  CUSTOMER_ADVISER = 'CUSTOMER_ADVISER',
  CARD_MANAGER = 'CARD_MANAGER',

}
export class User {
  serviceToken!: string;
  user!: {
    firstName?: string;
    lastName?: string;
    id: string;
    email: string;
    password: string;
    name: string;
    role: Role1[];
    country: string | null;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApiUserToUser(apiUser: any, serviceToken: string = ''): User {

  apiUser = JSON.parse(apiUser);
  return {
    serviceToken,
    user: {
      firstName: apiUser.firstname,
      lastName: apiUser.lastname,
      id: String(apiUser.id),
      email: apiUser.email,
      password: apiUser.password, // peut être absent
      name: apiUser.firstname && apiUser.lastname ? `${apiUser.firstname} ${apiUser.lastname}` : apiUser.firstname || apiUser.lastname || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: Array.isArray(apiUser.roles) ? apiUser.roles.map((r: any) => r.name) : [],
      country: apiUser.country || null
    }
  };
}
