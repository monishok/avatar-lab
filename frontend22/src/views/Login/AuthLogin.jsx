import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';

import * as Yup from 'yup';
import { Formik } from 'formik';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const AuthLogin = ({ ...rest }) => {
  const theme = useTheme();
  const location = useLocation();
  const fromRegister = location.state?.fromRegister;

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      {/*message if redirected from register */}
      {fromRegister && (
        <Box mb={2}>
          <FormHelperText sx={{ color: 'green' }}>
            You have been registered. Please log in.
          </FormHelperText>
        </Box>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const res = await fetch('http://localhost:5000/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                email: values.email,
                password: values.password
              })
            });

            const data = await res.json();

            if (data.message === 'Already logged in' || res.ok) {
              window.location.href = '/dashboard';
              return;
            }

            throw new Error(data.message || 'Login failed');
          } catch (err) {
            setErrors({ submit: err.message });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...rest}>
            {/* Email Field */}
            <TextField
              error={Boolean(touched.email && errors.email)}
              fullWidth
              helperText={touched.email && errors.email}
              label="Email Address"
              margin="normal"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              type="email"
              value={values.email}
              variant="outlined"
            />

            {/* Password Field */}
            <FormControl
              fullWidth
              error={Boolean(touched.password && errors.password)}
              sx={{ mt: theme.spacing(3), mb: theme.spacing(1) }}
              variant="outlined"
            >
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {touched.password && errors.password && (
                <FormHelperText error>{errors.password}</FormHelperText>
              )}
            </FormControl>

            {/* Submit Error */}
            {errors.submit && (
              <Box mt={3}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            {/* Submit Button */}
            <Box mt={2}>
              <Button
                color="primary"
                disabled={isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Log In
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;