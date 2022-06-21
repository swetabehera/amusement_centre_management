import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Typography from '@material-ui/core/Typography';
import Link from '../../src/components/Link';
import Box from '@material-ui/core/Box';
import restApp, { authCookieName } from '../../src/apis/rest.app';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Logo from '../../src/assets/Logo.svg';
import { useUser } from '../../src/store/UserContext';
import { useRouter } from 'next/router';
import ImageFrame from '../../src/components/ImageFrame';
import useHandleError from '../../src/hooks/useHandleError';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(8),
    marginTop: theme.spacing(4),
    // marginLeft: -25,
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(3),
    },
  },
  image: {
    height: 'auto',
    width: 200,
  },
  title: {
    color: theme.palette.primary.dark,
  },
  link: {
    color: theme.palette.primary.main,
  },
  subTitle: {
    fontSize: '19px',
  },
}));

const Login = () => {
  const classes = useStyles();
  const handleError = useHandleError();
  const Router = useRouter();
  const [user, setUser] = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (email.trim() === '') {
      setEmailError('Please enter a valid email.');
      return false;
    } else {
      setEmailError('');
    }
    if (
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email,
      )
    ) {
      setEmailError('');
    } else {
      setEmailError('Please enter a valid email.');
      return false;
    }
    if (password.trim() === '') {
      setPasswordError('Please enter a valid password.');
      return false;
    } else {
      setPasswordError('');
    }
    return true;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        setLoading(true);
        const { user, accessToken } = await restApp.authenticate(
          {
            strategy: 'local',
            email,
            password,
          },
          {
            query: {
              $eager: '[permissions]',
            },
          },
        );
        if (user) {
          localStorage.setItem(authCookieName, accessToken);
          setUser(user);
          Router.push('/');
          setLoading(false);
        } else {
          enqueueSnackbar('You are not allowed to login here.', { variant: 'error' });
        }
      } catch (error) {
        handleError()(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleEnter = (event) => {
    if (event.keyCode === 13) {
      handleLogin();
    }
  };

  useEffect(() => {
    if (user) Router.push('/');
  }, []);

  return (
    <ImageFrame>
      <Box maxWidth="470px" width="90%">
        <div className={classes.logoContainer}>
          <img alt="Login Logo" className={classes.image} src={Logo} />
        </div>
        <Typography className={classes.title} variant="h3">
          Login
        </Typography>
        <Box mt={1} />
        <Typography variant="subtitle1">Sign In to your account</Typography>
        <Box mt={5.5} />
        <TextField
          autoFocus
          color="primary"
          error={!!emailError}
          fullWidth
          helperText={emailError}
          label={'Email'}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={handleEnter}
          type={'email'}
          value={email}
          variant="outlined"
        />
        <Box mt={2} />
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          color={'primary'}
          error={!!passwordError}
          fullWidth
          helperText={passwordError}
          label={'Password'}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={handleEnter}
          type={showPassword ? 'text' : 'password'}
          value={password}
          variant="outlined"
        />
        <Box mt={3} />
        <Button color="primary" disabled={loading} fullWidth onClick={handleLogin} size={'large'} variant={'contained'}>
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        <Box display="flex" justifyContent="space-between">
          <Box />
          <Box mt={2.5}>
            <Link href="/forgot-password">
              <Typography className={classes.link} variant={'body2'}>
                Forgot Password
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </ImageFrame>
  );
};

Login.layout = null;

export default Login;
