import { BusinessRegistrationForm } from "./registration-form";

export const metadata = {
  title: "Register Your Business",
  description: "List your business on Find My Biz — South Africa's trusted business directory.",
};

export default async function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">List Your Business</h1>
        <p className="text-muted-foreground">
          Join Find My Biz and start receiving qualified leads from customers across South Africa.
        </p>
      </div>
      <BusinessRegistrationForm />
    </div>
  );
}
