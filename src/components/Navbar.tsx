import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Moon, Sun, GraduationCap, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Features", path: "/features" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Groups", path: "/groups" },
    { name: "Matching", path: "/matching" },
    { name: "Resources", path: "/resources" },
    { name: "Progress", path: "/progress" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary to-secondary glow-hover">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold gradient-text">SGF</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-2 py-2 transition-colors duration-300 text-sm whitespace-nowrap ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                  />
                )}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm text-muted-foreground hover:text-foreground px-2"
                >
                  More
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-background/95 backdrop-blur-sm border-border z-50"
              >
                {navLinks.slice(5).map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className={`w-full cursor-pointer ${
                        isActive(link.path)
                          ? "text-primary bg-primary/10"
                          : "text-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link to="/notifications">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  3
                </span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/login">
              <Button variant="outline" size="sm" className="glass border-primary/50 hover:border-primary">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                  Sign Up
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
