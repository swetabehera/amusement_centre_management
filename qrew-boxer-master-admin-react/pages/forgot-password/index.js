  
import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useSnackbar } from 'notistack';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Logo from '../../src/assets/Logo.svg';
import { useUser } from '../../src/store/UserContext';
import { ForgetPasswordService, UsersService } from '../../src/apis/rest.app';
import OtpInput from 'react-otp-input';
import { useRouter } from 'next/router';
import ImageFrame from '../../src/components/ImageFrame';
import Hidden from '@material-ui/core/Hidden';
import useHandleError from '../../src/hooks/useHandleError';
import useTheme from '@material-ui/core/styles/useTheme';

const useStyles = makeStyles((theme) => ({
  logoContainer: {
    display: 'flex',
    marginBottom: theme.spacing(8),
    marginTop: theme.spacing(4),
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
  otpBox: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
    },
  },
  timerButton: {
    fontSize: '20px',
    color: theme.palette.background.text,
    fontWeight: '800',
    lineHeight: 1,
  },
  flexGrow: {},
}));

const VerifyEmail = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [user] = useUser();
  const Router = useRouter();
  const handleError = useHandleError();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = React.useState(user && user.user && user.user.email ? user.user.email : '');
  const [emailError, setEmailError] = React.useState('');
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetNewPasswordError, setResetNewPasswordError] = useState('');

  useEffect(() => {
    if (timerRunning) {
      setTimeout(() => {
        if (timer - 1 === 0) setTimerRunning(false);
        setTimer(timer - 1);
      }, 1000);
    }
  }, [timer]);

  const validate = () => {
    if (email.trim() === '') {
      setEmailError('Please enter a valid email.');
      return false;
    } else {
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
    }
    return true;
  };

  const handleSendOtp = () => {
    if (validate()) {
      setLoading(true);
      ForgetPasswordService.create({
        email: email,
      })
        .then(() => {
          setOtpSent(true);
          setLoading(false);
          enqueueSnackbar('OTP sent successfully.', {
            variant: 'success',
          });
          setLoading(false);
          setTimerRunning(true);
          setTimer(30);
          setOtp('');
        })
        .catch((error) => {
          handleError()(error);
          setLoading(false);
        });
    }
  };

  const validateOtp = () => {
    if (otp.length !== 4) {
      enqueueSnackbar('Please enter a valid OTP.', {
        variant: 'error',
      });
      return false;
    } else {
      return true;
    }
  };

  const handleEnterEmail = (event) => {
    if (event.keyCode === 13) {
      handleSendOtp();
    }
  };

  const handleEnterPassword = (event) => {
    if (event.keyCode === 13) {
      handleResetPassword();
    }
  };

  const handleEnterOtp = (event) => {
    if (event.keyCode === 13) {
      handleVerifyOtp();
    }
  };

  const handleVerifyOtp = () => {
    if (validateOtp()) {
      setVerifyLoading(true);
      ForgetPasswordService.patch(null, {
        email: email,
        otp: otp,
      })
        .then((res) => {
          console.log('resss---> ', res);
          console.log('resss---> token --> ', res.token);
          console.log('resss---> user ---> ', res.userId);

          setToken(res.token);
          setUserId(res.userId);
          setVerifyLoading(false);
        })
        .catch((error) => {
          handleError()(error);
          setVerifyLoading(false);
        });
    }
  };
  const validatePasswordField = () => {
    if (newPassword === '') {
      enqueueSnackbar('Please enter a valid new Password', {
        variant: 'error',
      });
      return false;
    }
    if (resetNewPassword === '' || resetNewPassword !== newPassword) {
      enqueueSnackbar('Please enter a valid password. Both passwords must match.', {
        variant: 'error',
      });
      return false;
    }
    return true;
  };
  const handleResetPassword = () => {
    if (validatePasswordField()) {
      setResetPasswordLoading(true);
      UsersService.patch(
        userId,
        {
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
        .then(() => {
          setResetPasswordLoading(false);
          enqueueSnackbar('Password reset successfully.', {
            variant: 'success',
          });
          Router.push('/login');
        })
        .catch((error) => {
          handleError()(error);
          setResetPasswordLoading(false);
        })
        .finally(() => {
          setResetPasswordLoading(false);
        });
    }
  };

  return (
    <ImageFrame>
      <Box maxWidth="470px" width="90%">
        <div className={classes.logoContainer}>
          <img alt="Login Logo" className={classes.image} src={Logo} />
        </div>
        <Typography className={classes.title} variant="h3">
          Forgot Password
        </Typography>
        <Box mt={1} />
        <Typography variant="subtitle1">
          {token
            ? 'Enter new passwords to reset your password.'
            : !otpSent
            ? 'Please enter your associated email id to continue.'
            : 'OTP is sent to your email. Please check to continue.'}
        </Typography>
        <Box mt={5} />
        {token ? (
          <>
            <TextField
              autoFocus
              error={!!newPasswordError}
              fullWidth
              helperText={newPasswordError}
              label={'New Password'}
              onKeyDown={handleEnterPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type={'password'}
              value={newPassword}
              variant="outlined"
            />
            <Box mt={2} />
            <TextField
              error={!!resetNewPasswordError}
              fullWidth
              onKeyDown={handleEnterPassword}
              helperText={resetNewPasswordError}
              label={'Re-Enter New Password'}
              onChange={(event) => setResetNewPassword(event.target.value)}
              type={'password'}
              value={resetNewPassword}
              variant="outlined"
            />
          </>
        ) : !otpSent ? (
          <TextField
            autoFocus
            error={!!emailError}
            fullWidth
            onKeyDown={handleEnterEmail}
            helperText={emailError}
            label={'Register Email'}
            onChange={(event) => setEmail(event.target.value)}
            type={'email'}
            value={email}
            variant="outlined"
          />
        ) : (
          <>
            <Box className={classes.otpBox} display={'flex'}>
              <OtpInput
                className={classes.otp}
                errorStyle="error"
                focusStyle={{ border: `2px solid ${theme.palette.primary.main}` }}
                hasErrored={false}
                inputStyle={{
                  width: '45px',
                  height: '45px',
                  margin: ' 10px 12px 10px 0px',
                  fontSize: '1rem',
                  borderRadius: 7,
                  border: `1px solid ${theme.palette.common.black}`,
                  outline: 'none',
                }}
                isDisabled={false}
                isInputNum={true}
                onKeyDown={handleEnterOtp}
                numInputs={4}
                onChange={(event) => setOtp(event)}
                separator={<span className={classes.separator}> </span>}
                shouldAutoFocus
                value={otp}
              />
              <Hidden xsDown>
                <span className={classes.flexGrow} />
                <Box
                  alignItems={'center'}
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                  marginLeft={4}
                  marginTop={1}
                >
                  <Typography className={classes.timerButton}>
                    {'00:'}
                    {timer > 9 ? timer : '0' + timer}
                  </Typography>
                  <Button color={'primary'} disabled={timer !== 0 || loading} onClick={handleSendOtp} size="small">
                    {loading ? <CircularProgress size={13} /> : 'Resend OTP'}
                  </Button>
                </Box>
              </Hidden>
            </Box>
            <Hidden smUp>
              <Box display={'flex'} justifyContent={'center'}>
                <Box alignItems={'center'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                  <Typography className={classes.timerButton}>
                    {'00:'}
                    {timer > 9 ? timer : '0' + timer}
                  </Typography>
                  <Button color={'primary'} disabled={timer !== 0 || loading} onClick={handleSendOtp} size="small">
                    {loading ? <CircularProgress size={13} /> : 'Resend OTP'}
                  </Button>
                </Box>
              </Box>
            </Hidden>
          </>
        )}

        <Box mt={3} />
        <Button
          color="primary"
          disabled={token ? resetPasswordLoading : !otpSent ? loading : verifyLoading}
          fullWidth
          onClick={token ? handleResetPassword : !otpSent ? handleSendOtp : handleVerifyOtp}
          variant={'contained'}
        >
          {token ? (
            resetPasswordLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Reset Password'
            )
          ) : !otpSent ? (
            loading ? (
              <CircularProgress size={24} />
            ) : (
              'Send OTP'
            )
          ) : verifyLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Verify OTP'
          )}
        </Button>
        <Box mb={10} />
      </Box>
    </ImageFrame>
  );
};

VerifyEmail.layout = null;

export default VerifyEmail;
