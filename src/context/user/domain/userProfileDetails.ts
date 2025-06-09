interface BillingAddress {
  id: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  createdAt: Date;
  alias?: string;
  brand?: string;
}

interface ActivitySummary {
  musiciansContacted: number;
  eventsOrganized: number;
}

export interface UserProfileDetails {
  id: string;
  firstName: string;
  familyName: string;
  role: string;
  email: string;
  joinedDate: Date;
  phoneNumber?: string;
  nationalId?: string;
  imageUrl?: string;
  bio?: string;

  paymentMethods: PaymentMethod[];
  activitySummary: ActivitySummary;
  billingAddress?: BillingAddress;
}
