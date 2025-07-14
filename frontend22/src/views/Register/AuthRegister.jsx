import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  FormHelperText,
  TextField,
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
import { useNavigate } from 'react-router-dom'; 

const AuthRegister = ({ ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <Formik
      initialValues={{
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string()
          .min(3, 'Username must be at least 3 characters')
          .max(50, 'Username is too long')
          .required('Username is required'),
        email: Yup.string()
          .email('Must be a valid email')
          .max(255)
          .required('Email is required'),
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
          .matches(/[a-z]/, 'Must contain at least one lowercase letter')
          .matches(/[0-9]/, 'Must contain at least one number')
          .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      })}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          const res = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: values.username,
              email: values.email,
              password: values.password
            })
          });

          const data = await res.json();

          if (data.message === 'Already logged in') {
            navigate('/dashboard');
            return;
          }

          if (!res.ok) {
            if (data.field === 'username') {
              setErrors({ username: data.message });
            } else if (data.field === 'email') {
              setErrors({ email: data.message });
            } else {
              setErrors({ submit: data.message });
            }
            return;
          }
          navigate('/application/login', { state: { fromRegister: true } });

        } catch (error) {
          setErrors({ submit: 'Server error. Please try again later.' });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit} {...rest}>
          {/* Username */}
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.username && errors.username)}
            helperText={touched.username && errors.username}
            variant="outlined"
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email Address"
            margin="normal"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
            variant="outlined"
          />

          {/* Password */}
          <FormControl
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(touched.password && errors.password)}
          >
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            {touched.password && errors.password && (
              <FormHelperText>{errors.password}</FormHelperText>
            )}
          </FormControl>

          {/* Confirm Password */}
          <FormControl
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
          >
            <InputLabel>Confirm Password</InputLabel>
            <OutlinedInput
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm Password"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <FormHelperText>{errors.confirmPassword}</FormHelperText>
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
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              Register
            </Button>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default AuthRegister;