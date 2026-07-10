import { landingPages } from "@/features/marketing/landing-configs";
import { landingMetadata, SeoLandingPage } from "@/features/marketing/seo-landing-page";

const config = landingPages.csvDataCleaner;

export const metadata = landingMetadata(config);

export default function Page() {
  return <SeoLandingPage config={config} />;
}
