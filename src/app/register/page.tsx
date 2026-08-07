import { isLaunchPromoActive } from "@/constants/launch-promo";
import { BusinessRegistrationForm } from "./registration-form";

export const metadata = {
  title: "Register Your Business",
  description: "List your business on Find My Biz — South Africa's trusted business directory.",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">List Your Business</h1>
        <p className="text-muted-foreground">
          Join Find My Biz and start receiving qualified leads from customers across South Africa.
        </p>
      </div>
      <BusinessRegistrationForm launchPromoEnabled={isLaunchPromoActive()} />
    </div>
  );
}
