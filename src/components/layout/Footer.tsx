import { Link } from "react-router-dom";
import { Zap, Linkedin, Mail, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <div className="rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center" style={{ width: 48, height: 48 }}>
                <img src="/X-Ops Club logo design.png" alt="X-Ops Club Logo" className="w-12 h-12 object-contain m-0" />
              </div>
              <span className="text-gradient">X-Ops</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Empowering the next generation of tech innovators through workshops, 
              hackathons, and a vibrant community of passionate developers.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.linkedin.com/in/xops-club-ju-fet/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/xops.club_ju/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=xopsclub.cse.ju@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            
            {/* Jain Logo */}
            <div className="-mt-2 flex items-center">
              <img 
                src="/jain logo.jpg" 
                alt="Jain Symbol" 
                className="h-40 w-56 object-contain"
                style={{ mixBlendMode: 'darken', filter: 'brightness(0.95) contrast(1.8) saturate(1.5) hue-rotate(0deg)' }}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Events", path: "/events" },
                { name: "About", path: "/about" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Get Involved</h3>
            <ul className="space-y-3">
              {[
                { name: "Join Us", path: "/signup" },
                { name: "Upcoming Events", path: "/events" },
                { name: "Contact", path: "/about" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} X-Ops Tech Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
