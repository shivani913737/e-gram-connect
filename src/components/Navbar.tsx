import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/schemes", label: t("nav.schemes") },
  ];

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Gram Connect Logo" className="h-10 w-10" />
          <span className="text-lg font-bold text-primary">Gram Connect</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <LanguageSwitcher />
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">{t("nav.dashboard")}</Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout}>{t("nav.logout")}</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">{t("nav.login")}</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">{t("nav.signup")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="py-2">
            <LanguageSwitcher />
          </div>
          <div className="mt-3 flex gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">{t("nav.dashboard")}</Button>
                </Link>
                <Button size="sm" className="flex-1" onClick={handleLogout}>{t("nav.logout")}</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">{t("nav.login")}</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">{t("nav.signup")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
