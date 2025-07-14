import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Typography } from '@mui/material';

import NavGroup from './NavGroup';
import getMenuItems from 'menu-items'; 

const MenuList = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/check_auth', { withCredentials: true })
      .then(() => {
        setIsAuthenticated(true);
        setLoading(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // or a spinner while checking auth

  const menuItems = getMenuItems(isAuthenticated);

  return menuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });
};

export default MenuList;
