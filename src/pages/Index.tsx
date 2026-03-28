import RegionSelector from "@/components/RegionSelector";
import { useLanguage } from "@/i18n/LanguageContext";
import villageBg from "@/assets/village-bg.jpg";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <img
        src={villageBg}
        alt="Indian rural village landscape"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-background/40" />
      <div className="relative z-10">
        <h1 className="mb-6 text-center text-3xl font-bold text-foreground drop-shadow-lg md:text-4xl">
          {t("index.title")} <span className="text-primary">{t("index.brand")}</span>
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-center text-sm text-muted-foreground drop-shadow md:text-base">
          {t("index.subtitle")}
        </p>
        <RegionSelector />
      </div>
    </div>
  );
};

export default Index;
