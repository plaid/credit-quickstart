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
  ssn?: string;
  homeLending?: boolean;
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

export interface NetworkInsightsData {
  report?: {
    report_id?: string;
    generated_time?: string;
    network_attributes?: Record<string, unknown>;
    items?: Array<{
      institution_id?: string;
      institution_name?: string;
      item_id?: string;
    }>;
  };
}

export interface CashflowInsightsData {
  report?: {
    report_id?: string;
    generated_time?: string;
    plaid_check_score?: {
      score?: number | null;
      reason_codes?: string[];
    } | null;
    attributes?: Record<string, unknown>;
  };
}

export interface LendScoreData {
  report?: {
    report_id?: string;
    generated_time?: string;
    lend_score?: {
      score?: number | null;
      reason_codes?: string[];
      error_reason?: string | null;
    } | null;
  };
}

export interface VoaAmountField {
  amount: number;
  iso_currency_code: string | null;
  unofficial_currency_code?: string | null;
}

export interface VoaAccount {
  account_id: string;
  name: string;
  official_name?: string | null;
  mask?: string | null;
  type: string;
  subtype?: string | null;
  days_available: number;
  ownership_type?: string | null;
  balances: {
    available?: number | null;
    current?: number | null;
    limit?: number | null;
    iso_currency_code?: string | null;
  };
  transactions_insights: {
    all_transactions: BaseReportTransaction[];
    start_date?: string | null;
    end_date?: string | null;
  };
  owners?: BaseReportOwner[];
}

export interface EmploymentRefreshTransaction {
  account_id: string;
  original_description: string;
  date: string;
  pending: boolean;
}

export interface HomeLendingData {
  report?: {
    report_id?: string;
    client_report_id?: string | null;
    employment_refresh?: {
      generated_time: string;
      days_requested: number;
      items: Array<{
        institution_name: string;
        institution_id: string;
        item_id: string;
        last_update_time: string;
        accounts: Array<{
          account_id: string;
          name: string;
          official_name?: string | null;
          type: string;
          subtype?: string | null;
          transactions: EmploymentRefreshTransaction[];
        }>;
      }>;
    } | null;
    voa?: {
      generated_time: string;
      days_requested: number;
      items: Array<{
        institution_name: string;
        institution_id: string;
        item_id: string;
        last_update_time: string;
        accounts: VoaAccount[];
      }>;
      attributes: {
        total_inflow_amount?: VoaAmountField | null;
        total_outflow_amount?: VoaAmountField | null;
      };
    } | null;
  };
}
