import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "About", path: "/about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<"admin" | "member" | null>(null);
  const location = useLocation();

  useEffect(() => {
    const session = getAuthSession();
    setRole(session?.user.role ?? null);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isLoggedIn = Boolean(role);

  const handleLogout = () => {
    clearAuthSession();
    setRole(null);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-0">
            <img src="/favicon.ico" alt="X-Ops Logo" className="h-28 w-28" />
            <span className="hidden sm:inline font-bold text-lg tracking-tight">The X-Ops Club</span>
          </Link>

          {/* Desktop Navigation & Auth Buttons in one line right-aligned */}
          <div className="hidden md:flex items-center justify-end space-x-8 ml-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "nav-link py-2 text-sm font-medium transition-colors",
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            {role === "admin" && (
              <Button variant="outline" asChild>
                <Link to="/admin">Admin</Link>
              </Button>
            )}
            {isLoggedIn ? (
              <Button variant="ghost" asChild>
                <Link to="/" onClick={handleLogout}>Logout</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Join X-Ops</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-80 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 px-4">
              {role === "admin" && (
                <Button variant="outline" asChild className="justify-center">
                  <Link to="/admin" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                </Button>
              )}
              {isLoggedIn ? (
                <Button variant="ghost" asChild className="justify-center">
                  <Link to="/" onClick={handleLogout}>Logout</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-center">
                    <Link to="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                  </Button>
                  <Button variant="hero" asChild className="justify-center">
                    <Link to="/signup" onClick={() => setIsOpen(false)}>Join X-Ops</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
