import { useState } from "react";
import { ApplicantFormData } from "../../lib/types";

interface ApplicantFormProps {
  onSubmit: (data: ApplicantFormData) => void;
  isLoading: boolean;
}

const TEST_DATA: ApplicantFormData = {
  firstName: "Alberta",
  lastName: "Bobbeth Charleson",
  dateOfBirth: "1990-01-01",
  email: "alberta.charleson@example.com",
  phoneNumber: "+14155550011",
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
  },
};

const ApplicantForm: React.FC<ApplicantFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ApplicantFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFillTestData = () => {
    setFormData(TEST_DATA);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass =
    "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-mint-450";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Loan Application</h2>
        <button
          type="button"
          onClick={handleFillTestData}
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 border border-gray-300"
        >
          Fill with test data
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Please provide your identity information to get started.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              className={inputClass}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              className={inputClass}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Date of Birth</label>
          <input
            className={inputClass}
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input
            className={inputClass}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            className={inputClass}
            type="tel"
            name="phoneNumber"
            autoComplete="off"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Street Address</label>
          <input
            className={inputClass}
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className={labelClass}>City</label>
            <input
              className={inputClass}
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              className={inputClass}
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              maxLength={2}
              required
            />
          </div>
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input
              className={inputClass}
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-mint-600 text-white py-2 px-4 rounded hover:bg-mint-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? "Setting up your account..." : "Continue to Bank Connection"}
        </button>
      </form>

    </div>
  );
};

export default ApplicantForm;
