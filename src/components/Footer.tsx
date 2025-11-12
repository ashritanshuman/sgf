import { Link } from "react-router-dom";
import { GraduationCap, Mail, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold gradient-text">Study Group Finder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with like-minded students and achieve academic excellence together.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/groups" className="hover:text-primary transition-colors">Study Groups</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg glass hover:bg-primary/20 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg glass hover:bg-primary/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg glass hover:bg-primary/20 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg glass hover:bg-primary/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Study Group Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
