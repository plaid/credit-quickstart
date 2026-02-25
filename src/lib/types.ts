export interface ApplicantFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface BaseReportOwner {
  names: string[];
  emails: { data: string; type: string }[];
  phone_numbers: { data: string; type: string }[];
  addresses: {
    data: { street: string; city: string; region: string; postal_code: string; country: string };
    primary: boolean;
  }[];
}

export interface BaseReportAccount {
  account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype?: string;
  balances: {
    available?: number | null;
    current?: number | null;
    limit?: number | null;
  };
  owners?: BaseReportOwner[];
  transactions?: BaseReportTransaction[];
}

export interface BaseReportTransaction {
  transaction_id: string;
  date: string;
  name?: string;
  description?: string;
  original_description?: string;
  amount: number;
  merchant_name?: string;
  credit_category?: {
    primary: string;
    detailed?: string;
  };
}

export interface BaseReportData {
  report?: {
    date_generated?: string;
    items?: Array<{
      accounts?: BaseReportAccount[];
      transactions?: BaseReportTransaction[];
    }>;
  };
}

export interface IncomeStream {
  income_stream_id: string;
  name: string;
  status: string;
  pay_frequency?: string;
  projected_monthly_income?: number;
  active?: boolean;
}

export interface IncomeInsightsData {
  report?: {
    items?: Array<{
      bank_income_summary?: {
        total_amount?: number;
        total_transactions?: number;
        income_sources_count?: number;
        income_categories_count?: number;
        start_date?: string;
        end_date?: string;
        historical_average_monthly_income?: number;
        projected_monthly_income?: number;
      };
      bank_income_sources?: Array<{
        income_source_id: string;
        income_description: string;
        income_category: string;
        start_date?: string;
        end_date?: string;
        pay_frequency?: string;
        projected_monthly_income?: number;
        historical_average_monthly_income?: number;
        historical_average_monthly_gross_income?: number;
        normalized_pay_frequency?: string;
        employer?: {
          name?: string;
        };
        bank_income_streams?: IncomeStream[];
      }>;
    }>;
  };
}
