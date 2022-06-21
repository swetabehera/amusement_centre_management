  

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { Bar, Line } from 'react-chartjs-2';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import InputBase from '@material-ui/core/InputBase';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useSnackbar } from 'notistack';
import TotalAdmins from '../public/TotalAdmins.svg';
import TotalProducts from '../public/TotalProducts.svg';
import TotalParts from '../public/TotalParts.svg';
import TotalActiveDevices from '../public/TotalActiveDevices.svg';
import TotalSales from '../public/TotalSales.svg';
import {
  MasterAdminDashboardAdminStatisticsService,
  MasterAdminDashboardProductStatisticsService,
  MasterAdminDashboardSalesStatisticsService,
  MasterAdminDashboardStatisticsService,
} from '../src/apis/rest.app';
import { useRouter } from 'next/router';

const useStyle = makeStyles(() => ({
  paperGraph: {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
  },
  objectDetectedTypography: {
    color: '#323232',
  },
  changesDetected: {
    fontWeight: 500,
    fontSize: '12px',
    color: '#787878',
    lineHeight: '15px',
  },
  transactionWrapper: {
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '5px',
      height: '5px',
    },
    // '&::-webkit-scrollbar-track': {
    //   boxShadow: '#E7DFF7',
    //   webkitBoxShadow: '#E7DFF7',
    //   background: '#E7DFF7',
    // },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#C4C4C4',
    },
  },
}));

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: 20,
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: '#fff',
    fontSize: 12,
    color: theme?.palette?.primary?.main,
    padding: '4px 10px 4px 10px',
    transition: theme?.transitions?.create(['box-shadow']),
  },
}))(InputBase);

const Dashboard = () => {
  const classes = useStyle();
  const Router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [adminOnboarded, setAdminOnboarded] = useState('weekly');
  const [adminOnboardedData, setAdminOnboardedData] = useState();
  const [productReport, setProductReport] = useState('weekly');
  const [productReportData, setProductReportData] = useState();
  const [salesReport, setSalesReport] = useState('weekly');
  const [salesReportData, setSalesReportData] = useState();
  const [statistics, setStatistics] = useState();

  const lineGraph = (canvas) => {
    const ctx = canvas.getContext('2d');

    //1. Using gradient background.
    let gradient = ctx.createLinearGradient(236, 219, 236, 0.25);
    gradient.addColorStop(0, 'rgba(128, 13, 128, 0.07)');
    gradient.addColorStop(1, 'rgba(128, 13, 128, 5)');

    const result = {
      // image:Image,
      labels: Object.keys(productReportData),
      datasets: [
        {
          fill: true,
          borderColor: '#7F0D7F',
          label: 'assigned',
          data: Object.keys(productReportData).map((each) => productReportData[each]), // returns the appropriate value
          backgroundColor: gradient,
          pointRadius: 4,
          pointBackgroundColor: '#7F0D7F',
        },
      ],
    };
    return result;
  };

  const totalSalesMadeGraph = (canvas) => {
    const ctx = canvas.getContext('2d');

    //1. Using gradient background.
    let gradient = ctx.createLinearGradient(236, 219, 236, 0.25);
    gradient.addColorStop(0, 'rgba(128, 13, 128, 0.07)');
    gradient.addColorStop(1, 'rgba(128, 13, 128, 5)');

    return {
      // image:Image,
      labels: Object.keys(salesReportData?.salesReport),
      datasets: [
        {
          fill: true,
          borderColor: '#7F0D7F',
          label: 'Sales',
          data: Object.keys(salesReportData?.salesReport).map((each) => salesReportData?.salesReport[each]),
          backgroundColor: gradient,
          pointRadius: 4,
          pointBackgroundColor: '#7F0D7F',
          lineTension: 0,
        },
      ],
    };
  };

  useEffect(() => {
    MasterAdminDashboardStatisticsService.create({})
      .then((res) => {
        setStatistics(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, []);

  useEffect(() => {
    MasterAdminDashboardAdminStatisticsService.create({
      adminOnBoardInterval: adminOnboarded,
    })
      .then((res) => {
        setAdminOnboardedData(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, [adminOnboarded]);

  useEffect(() => {
    MasterAdminDashboardProductStatisticsService.create({
      productSaleInterval: productReport,
    })
      .then((res) => {
        setProductReportData(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, [productReport]);

  useEffect(() => {
    MasterAdminDashboardSalesStatisticsService.create({
      salesReportInterval: salesReport,
    })
      .then((res) => {
        setSalesReportData(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, [salesReport]);

  return (
    <Box textAlign={'center'}>
      <Grid container spacing={3}>
        <Grid item md={5} sm={12} xs={12}>
          <Grid container spacing={3}>
            <Grid item md={6} sm={6} xs={12}>
              <Grid container spacing={2}>
                <Grid item md={12} sm={12} xs={12}>
                  <Paper>
                    <Box
                      p={4}
                      display={'flex'}
                      justifyContent={'center'}
                      flexDirection={'column'}
                      alignItems={'center'}
                      height={263}
                      textAlign={'center'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        Router.push('/admins');
                      }}
                    >
                      <img src={TotalAdmins} alt={'Total Admins'} />
                      <Box mt={2} />
                      <Typography variant={'h6'} style={{ color: '#B3A1B3' }}>
                        Total Admins
                      </Typography>
                      <Box mt={2} />
                      <Typography style={{ fontSize: 36, fontWeight: 600, lineHeight: '54px' }}>
                        {statistics?.totalClients && statistics?.totalClients}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <Paper>
                    <Box
                      p={4}
                      display={'flex'}
                      justifyContent={'center'}
                      flexDirection={'column'}
                      alignItems={'center'}
                      height={263}
                      textAlign={'center'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        Router.push('/products');
                      }}
                    >
                      <img src={TotalProducts} alt={'Total Products'} />
                      <Box mt={2} />
                      <Typography variant={'h6'} style={{ color: '#B3A1B3' }}>
                        Total Products
                      </Typography>
                      <Box mt={2} />
                      <Typography style={{ fontSize: 36, fontWeight: 600, lineHeight: '54px' }}>
                        {statistics?.totalProducts && statistics?.totalProducts}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={6} sm={6} xs={12}>
              <Grid container spacing={2}>
                <Grid item md={12} sm={12} xs={12}>
                  <Paper>
                    <Box
                      p={4}
                      display={'flex'}
                      justifyContent={'center'}
                      flexDirection={'column'}
                      alignItems={'center'}
                      height={263}
                      textAlign={'center'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        Router.push('/parts');
                      }}
                    >
                      <img src={TotalParts} alt={'Total Parts'} />
                      <Box mt={2} />
                      <Typography variant={'h6'} style={{ color: '#B3A1B3' }}>
                        Total Parts
                      </Typography>
                      <Box mt={2} />
                      <Typography style={{ fontSize: 36, fontWeight: 600, lineHeight: '54px' }}>
                        {statistics?.totalParts && statistics?.totalParts}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <Paper>
                    <Box
                      p={4}
                      display={'flex'}
                      justifyContent={'center'}
                      flexDirection={'column'}
                      alignItems={'center'}
                      height={263}
                      textAlign={'center'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        Router.push('/admins');
                      }}
                    >
                      <img src={TotalActiveDevices} alt={'Total Active Devices'} />
                      <Box mt={2} />
                      <Typography variant={'h6'} style={{ color: '#B3A1B3' }}>
                        Total Active Devices
                      </Typography>
                      <Box mt={2} />
                      <Typography style={{ fontSize: 36, fontWeight: 600, lineHeight: '54px' }}>
                        {statistics?.totalActiveDevices && statistics?.totalActiveDevices}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item md={7} sm={12} xs={12}>
          <Paper>
            <Box p={4} height={542}>
              <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                <Typography>Admin Onboarded:</Typography>
                <Box>
                  <FormControl>
                    <Select
                      input={<BootstrapInput />}
                      onChange={(e) => {
                        setAdminOnboarded(e.target.value);
                      }}
                      value={adminOnboarded}
                    >
                      <MenuItem value={'weekly'}>{'Weekly'}</MenuItem>
                      <MenuItem value={'monthly'}>{'Monthly'}</MenuItem>
                      <MenuItem value={'yearly'}>{'Yearly'}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box mt={2} height={168}>
                {adminOnboardedData && (
                  <Bar
                    data={{
                      labels: Object.keys(adminOnboardedData),
                      datasets: [
                        {
                          borderRadius: 8,
                          barThickness: 22,
                          label: 'Onboarded',
                          data: Object.keys(adminOnboardedData).map((each) => adminOnboardedData[each]),
                          borderWidth: 0,
                          backgroundColor: '#802680',
                        },
                      ],
                    }}
                    height={138}
                    // options={{
                    //     maintainAspectRatio: false,
                    // }}
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={2} />
      <Grid container spacing={3}>
        <Grid item md={7} sm={6} xs={12}>
          <Paper>
            <Box pt={4} pb={4} pl={4} pr={4} width={'100%'} height={562}>
              <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                <Typography>Products Assigned</Typography>
                <Box>
                  <FormControl>
                    <Select
                      input={<BootstrapInput />}
                      onChange={(e) => {
                        setProductReport(e.target.value);
                      }}
                      value={productReport}
                    >
                      <MenuItem value={'weekly'}>{'Weekly'}</MenuItem>
                      <MenuItem value={'monthly'}>{'Monthly'}</MenuItem>
                      <MenuItem value={'yearly'}>{'Yearly'}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box mt={2} height={166}>
                {productReportData && <Line legend={false} height={166} data={lineGraph} />}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={5} sm={6} xs={12}>
          <Paper>
            <Box height={562}>
              <Box pt={4} pb={2} pl={4} pr={4} display={'flex'} justifyContent={'flex-start'}>
                <Typography className={classes.objectDetectedTypography}>Top selling products</Typography>
              </Box>
              <Box
                pt={2}
                pb={2}
                pl={4}
                pr={4}
                borderBottom={'1px solid #C4C4C4'}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Box display={'flex'} alignItems={'center'}>
                  <Box fontSize={15} fontWeight={500} lineHeight={'36px'} color={'#7F0D7F'}>
                    {`#Product Id`}
                  </Box>
                  <Box fontWeight={500} fontSize={16} lineHeight={'24px'} display={'flex'} ml={5} color={'#333333'}>
                    {'Product Name'}
                  </Box>
                </Box>

                <Box
                  mr={2}
                  fontWeight={400}
                  fontSize={12}
                  lineHeight={'18px'}
                  display={'flex'}
                  mt={0.5}
                  color={'#333333'}
                >
                  {'Product Count'}
                </Box>
              </Box>
              <Box maxHeight={422} className={classes.transactionWrapper}>
                {statistics?.topSellingProducts.length > 0
                  ? statistics?.topSellingProducts?.map((each) => (
                      <Box
                        key={each?.productId}
                        pt={2}
                        pb={2}
                        pl={4}
                        pr={4}
                        borderBottom={'1px solid #C4C4C4'}
                        display={'flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                      >
                        <Box display={'flex'} alignItems={'center'}>
                          <Box
                            fontSize={24}
                            fontWeight={500}
                            lineHeight={'36px'}
                            color={'#7F0D7F'}
                            width={130}
                            textAlign={'left'}
                          >
                            {`#${each?.productId && each?.productId}`}
                          </Box>
                          <Box fontWeight={500} fontSize={16} lineHeight={'24px'} color={'#333333'}>
                            {each?.name && each?.name}
                          </Box>
                        </Box>

                        <Box
                          mr={2}
                          fontWeight={400}
                          fontSize={12}
                          lineHeight={'18px'}
                          display={'flex'}
                          mt={0.5}
                          color={'#333333'}
                        >
                          {each?.productCount && each?.productCount}
                        </Box>
                      </Box>
                    ))
                  : 'No products found'}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={5} />
      <Paper>
        <Box
          boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}
          bgcolor={'#fff'}
          pt={4}
          pb={4}
          pl={4}
          pr={4}
          width={'100%'}
          height={562}
        >
          <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
            <Box display={'flex'} alignItems={'center'}>
              <img src={TotalSales} alt={'Total Sales'} />
              <Box
                ml={1}
                fontSize={16}
                fontWeight={500}
                lineHeight={'18.96px'}
                letterSpacing={'0.2px'}
                color={'#B3A1B3'}
              >
                Total Sales made:
              </Box>
              <Box ml={1} fontSize={16} fontWeight={500} lineHeight={'18.96px'} letterSpacing={'0.2px'}>
                {salesReportData ? salesReportData?.totalSales : 0}
              </Box>
            </Box>
            <Box>
              <FormControl>
                <Select
                  input={<BootstrapInput />}
                  onChange={(e) => {
                    setSalesReport(e.target.value);
                  }}
                  value={salesReport}
                >
                  <MenuItem value={'weekly'}>{'Weekly'}</MenuItem>
                  <MenuItem value={'monthly'}>{'Monthly'}</MenuItem>
                  <MenuItem value={'yearly'}>{'Yearly'}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box mt={3} />
          <Grid container>
            <Grid item md={12} sm={12} xs={12}>
              <Box height={88}>{salesReportData && <Line legend={false} height={88} data={totalSalesMadeGraph} />}</Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
