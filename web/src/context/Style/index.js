/*
Copyright (c) 2025 Tethys Plex

This file is part of Veloera.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
// contexts/User/index.jsx

import React, { useState, useEffect } from 'react';
import { isMobile } from '../../helpers/index.js';

export const StyleContext = React.createContext({
  dispatch: () => null,
});

export const StyleProvider = ({ children }) => {
  const [state, setState] = useState({
    isMobile: isMobile(),
    showSider: false,
    siderCollapsed: false,
    shouldInnerPadding: false,
  });

  const dispatch = (action) => {
    if ('type' in action) {
      switch (action.type) {
        case 'TOGGLE_SIDER':
          setState((prev) => ({ ...prev, showSider: !prev.showSider }));
          break;
        case 'SET_SIDER':
          setState((prev) => ({ ...prev, showSider: action.payload }));
          break;
        case 'SET_MOBILE':
          setState((prev) => ({ ...prev, isMobile: action.payload }));
          break;
        case 'SET_SIDER_COLLAPSED':
          setState((prev) => ({ ...prev, siderCollapsed: action.payload }));
          break;
        case 'SET_INNER_PADDING':
          setState((prev) => ({ ...prev, shouldInnerPadding: action.payload }));
          break;
        default:
          setState((prev) => ({ ...prev, ...action }));
      }
    } else {
      setState((prev) => ({ ...prev, ...action }));
    }
  };

  useEffect(() => {
    const updateIsMobile = () => {
      const mobileDetected = isMobile();
      dispatch({ type: 'SET_MOBILE', payload: mobileDetected });

      // If on mobile, we might want to auto-hide the sidebar
      if (mobileDetected && state.showSider) {
        dispatch({ type: 'SET_SIDER', payload: false });
      }
    };

    updateIsMobile();

    const updateShowSider = () => {
      // check pathname
      const pathname = window.location.pathname;
      if (
        pathname === '' ||
        pathname === '/' ||
        pathname.includes('/home') ||
        pathname.includes('/chat')
      ) {
        dispatch({ type: 'SET_SIDER', payload: false });
        dispatch({ type: 'SET_INNER_PADDING', payload: false });
      } else if (pathname === '/setup') {
        dispatch({ type: 'SET_SIDER', payload: false });
        dispatch({ type: 'SET_INNER_PADDING', payload: false });
      } else {
        // Only show sidebar on non-mobile devices by default
        dispatch({ type: 'SET_SIDER', payload: !isMobile() });
        dispatch({ type: 'SET_INNER_PADDING', payload: true });
      }
    };

    updateShowSider();

    const updateSiderCollapsed = () => {
      const isCollapsed =
        localStorage.getItem('default_collapse_sidebar') === 'true';
      dispatch({ type: 'SET_SIDER_COLLAPSED', payload: isCollapsed });
    };

    updateSiderCollapsed();

    // Add event listeners to handle window resize
    const handleResize = () => {
      updateIsMobile();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <StyleContext.Provider value={[state, dispatch]}>
      {children}
    </StyleContext.Provider>
  );
};
