import HeroSection from '@/components/landing-page/HeroSection';
import ProductCapabilities from '@/components/landing-page/ProductCapabilities';
import SecurityMap from '@/components/landing-page/SecurityMap';
import AIAnalyst from '@/components/landing-page/AIAnalyst';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProductCapabilities />
      <SecurityMap />
      <AIAnalyst />
      {/* Additional sections would go here - for brevity, we're showing the core sections */}
    </>
  );
}