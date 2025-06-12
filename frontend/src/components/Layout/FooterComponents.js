import { Link } from "react-router-dom";
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "FAQ", href: "/faq" },
        { name: "Account", href: "/profile" },
        { name: "Manage Subscription", href: "/subscription" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Preferences", href: "/cookies" },
        { name: "Corporate Information", href: "/corporate" },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "Facebook", href: "https://facebook.com", external: true },
        { name: "Twitter", href: "https://twitter.com", external: true },
        { name: "Instagram", href: "https://instagram.com", external: true },
        { name: "YouTube", href: "https://youtube.com", external: true },
      ],
    },
  ];

  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-300 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-primary-500">
                StreamFlix
              </Link>
              <span className="text-gray-500 text-sm">
                © {currentYear} StreamFlix. All rights reserved.
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <select
                className="bg-dark-800 border border-dark-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
