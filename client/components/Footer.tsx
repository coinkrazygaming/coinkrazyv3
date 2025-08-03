import { Link } from "react-router-dom";
import {
  Crown,
  Shield,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                CoinKrazy
              </span>
            </div>
            <p className="text-muted-foreground">Where Fun Meets Fortune™</p>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-400"
              >
                <Shield className="w-3 h-3 mr-1" />
                18+ Only
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Home", path: "/" },
                { label: "Games", path: "/games" },
                { label: "Sign Up", path: "/register" },
                { label: "How to Play", path: "/how-to-play" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>319-473-0416</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>coinkrazy00@gmail.com</span>
              </div>
              <div className="space-y-1">
                <Link
                  to="/support"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </Link>
                <Link
                  to="/contact"
                  className="block text-muted-foreground hover:text-foreground"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <div className="space-y-2">
              {[
                "Terms of Service",
                "Privacy Policy",
                "Responsible Gaming",
                "Sweepstakes Rules",
              ].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 CoinKrazy.com. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <div className="text-sm text-muted-foreground text-center md:text-right max-w-md">
              No purchase necessary. Must be 18+ years old. Void where
              prohibited. Play responsibly.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
