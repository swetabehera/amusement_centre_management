import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import createTheme from '../src/theme';
import restApp, { authCookieName } from '../src/apis/rest.app';
import { UserProvider } from '../src/store/UserContext';
import Loader from '../src/components/loaders/Loader';
import { SnackbarProvider } from 'notistack';
import 'cropperjs/dist/cropper.css';
import { useRouter } from 'next/router';
import DefaultLayout from '../src/components/Layouts/DefaultLayout';

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const Router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  let Layout = DefaultLayout;
  if (Component.layout === null) Layout = React.Fragment;
  else if (Component.layout) Layout = Component.layout;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
    const token = localStorage.getItem(authCookieName);

    if (token) {
      restApp
        .authenticate(
          {
            strategy: 'jwt',
            accessToken: token,
          },
          {
            query: {
              $eager: '[permissions]',
            },
          },
        )
        .then((response) => {
          const { user, accessToken } = response;
          if (
            user.permissions &&
            user.permissions.length > 0 &&
            user.permissions.filter((e) => e.metaName === 'admin_login').length > 0
          ) {
            localStorage.setItem(authCookieName, accessToken);
            setUser(user);
            if (Router.pathname === '/login' || Router.pathname === '/forgot-password') {
              Router.push('/').then(() => setLoading(false));
            } else {
              setLoading(false);
            }
          } else {
            localStorage.removeItem(authCookieName);
            restApp.logout();
            Router.push('/login').then(() => setLoading(false));
          }
        })
        .catch(() => {
          localStorage.removeItem(authCookieName);
          restApp.logout();
          Router.push('/login').then(() => setLoading(false));
        });
    } else {
      if (!(Router.pathname === '/login' || Router.pathname === '/forgot-password')) {
        Router.push('/login').then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const theme = createTheme();

  return (
    <UserProvider value={user}>
      <Head>
        <title>QREW</title>
        <meta content={theme.palette.primary.main} name="theme-color" />
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {loading ? (
            <Loader />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </SnackbarProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
