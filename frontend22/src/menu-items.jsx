import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

const icons = {
  NavigationOutlinedIcon,
  HomeOutlinedIcon,
  ChromeReaderModeOutlinedIcon,
  SecurityOutlinedIcon,
  HistoryOutlinedIcon
};

const getMenuItems = (isAuthenticated) => ({
  items: [
    {
      id: 'navigation',
      type: 'group',
      icon: icons.NavigationOutlinedIcon,
      children: [
        {
          id: 'dashboard',
          title: 'Avatar Generator',
          type: 'item',
          icon: icons.HomeOutlinedIcon,
          url: '/dashboard'
        },
        {
          id: 'about',
          title: 'About',
          type: 'item',
          url: '/about',
          icon: icons.ChromeReaderModeOutlinedIcon
        },
        !isAuthenticated && {
          id: 'auth',
          title: 'Authentication',
          type: 'collapse',
          icon: icons.SecurityOutlinedIcon,
          children: [
            {
              id: 'login-1',
              title: 'Login',
              type: 'item',
              url: '/application/login',
              target: true
            },
            {
              id: 'register',
              title: 'Register',
              type: 'item',
              url: '/application/register',
              target: true
            }
          ]
        },
        isAuthenticated && {
          id: 'history',
          title: 'History',
          type: 'item',
          url: '/history',
          icon: icons.HistoryOutlinedIcon,
          breadcrumbs: false
        }
      ].filter(Boolean)
    }
  ]
});

export default getMenuItems;