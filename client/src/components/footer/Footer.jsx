import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and Description */}
          <div>
            <h1 className="text-2xl font-bold">WhiteBoard</h1>
            <p className="mt-4 text-sm">
              WhiteBoard is a platform that helps teams collaborate, brainstorm, and create ideas in real-time.
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h2 className="text-lg font-semibold">Quick Links</h2>
            <ul className="mt-4 text-sm">
              <li>
                <a href="/" className="hover:text-gray-400">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-gray-400">
                  About
                </a>
              </li>
              <li>
                <a href="/features" className="hover:text-gray-400">
                  Features
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h2 className="text-lg font-semibold">Contact Us</h2>
            <ul className="mt-4 text-sm">
              <li>
                <a href="mailto:support@whiteboard.com" className="hover:text-gray-400">
                  support@whiteboard.com
                </a>
              </li>
              <li>
                <a href="tel:+123456789" className="hover:text-gray-400">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <p className="hover:text-gray-400">123 Main St, City, Country</p>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h2 className="text-lg font-semibold">Follow Us</h2>
            <div className="mt-4 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; 2025 WhiteBoard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
