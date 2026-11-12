import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose, menuItems }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-[72px] left-0 h-screen lg:h-[calc(100vh-72px)] bg-kestrel-charcoal text-white w-64 transform transition-transform duration-300 ease-in-out z-30 border-r border-kestrel-gold/20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-white hover:text-kestrel-gold transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.divider ? (
                  <div className="my-4 border-t border-gray-600"></div>
                ) : item.heading ? (
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </h3>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-kestrel-gold text-kestrel-black font-semibold'
                          : 'text-gray-300 hover:bg-kestrel-black hover:text-kestrel-gold'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
