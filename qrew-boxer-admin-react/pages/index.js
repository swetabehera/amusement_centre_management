  

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { Line } from 'react-chartjs-2';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import InputBase from '@material-ui/core/InputBase';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useSnackbar } from 'notistack';
import TotalProducts from '../public/TotalProducts.svg';
import TotalActiveDevices from '../public/TotalActiveDevices.svg';
import TotalSales from '../public/TotalSales.svg';
import TotalActiveHours from '../public/TotalActiveHours.svg';
import {
  ClientProductService,
  DashboardActiveDeviceStatisticsService,
  DashboardSalesReportStatisticsService,
  DashboardStatisticsService,
} from '../src/apis/rest.app';
import { useUser } from '../src/store/UserContext';
import { useRouter } from 'next/router';

const useStyle = makeStyles(() => ({
  paperGraph: {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
  },
  objectDetectedTypography: {
    color: '#333333',
    fontWeight: 600,
    fontSize: '14px',
    lineHeight: '17px',
    letterSpacing: '0.2px',
  },
  changesDetected: {
    fontWeight: 500,
    fontSize: '12px',
    color: '#787878',
    lineHeight: '15px',
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
  const [user] = useUser();
  const Router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [statistics, setStatistics] = useState();
  const [activeHours, setActiveHours] = useState('weekly');
  const [activeHoursStatistics, setActiveHoursStatistics] = useState();
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedProductForSales, setSelectedProductForSales] = useState('all');
  const [salesReport, setSalesReport] = useState('weekly');
  const [salesReportStatistics, setSalesReportStatistics] = useState();

  const activeHoursLineGraph = (canvas) => {
    const ctx = canvas.getContext('2d');

    //1. Using gradient background.
    let gradient = ctx.createLinearGradient(236, 219, 236, 0.25);
    gradient.addColorStop(0, 'rgba(128, 13, 128, 0.07)');
    gradient.addColorStop(1, 'rgba(128, 13, 128, 5)');

    const result = {
      // image:Image,
      labels: Object.keys(activeHoursStatistics?.salesReport),
      datasets: [
        {
          fill: true,
          borderColor: '#7F0D7F',
          label: 'hours',
          data: Object.keys(activeHoursStatistics?.salesReport).map((each) => activeHoursStatistics?.salesReport[each]), // returns the appropriate value
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

    const result = {
      // image:Image,
      labels: Object.keys(salesReportStatistics?.salesReport),
      datasets: [
        {
          fill: true,
          borderColor: '#7F0D7F',
          label: 'sales',
          data: Object.keys(salesReportStatistics?.salesReport).map((each) => salesReportStatistics?.salesReport[each]), // returns the appropriate value
          backgroundColor: gradient,
          pointRadius: 4,
          pointBackgroundColor: '#7F0D7F',
          lineTension: 0.1,
        },
      ],
    };
    return result;
  };

  useEffect(() => {
    DashboardStatisticsService.create({
      clientId: user?.clients[0]?.id,
    })
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
    ClientProductService.find({
      query: {
        $eager: 'product',
        $sort: {
          createdAt: -1,
        },
        clientId: user?.clients[0]?.id,
        $limit: -1,
      },
    })
      .then((res) => {
        setProductList(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, []);

  useEffect(() => {
    let body;
    if (selectedProduct !== 'all') {
      body = {
        activeHoursReportInterval: activeHours,
        clientId: user?.clients[0]?.id,
        clientProductId: selectedProduct,
      };
    } else {
      body = {
        activeHoursReportInterval: activeHours,
        clientId: user?.clients[0]?.id,
      };
    }
    DashboardActiveDeviceStatisticsService.create(body)
      .then((res) => {
        setActiveHoursStatistics(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, [activeHours, selectedProduct]);

  useEffect(() => {
    let body;
    if (selectedProductForSales !== 'all') {
      body = {
        salesReportInterval: salesReport,
        clientId: user?.clients[0]?.id,
        clientProductId: selectedProductForSales,
      };
    } else {
      body = {
        salesReportInterval: salesReport,
        clientId: user?.clients[0]?.id,
      };
    }
    DashboardSalesReportStatisticsService.create(body)
      .then((res) => {
        setSalesReportStatistics(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, [salesReport, selectedProductForSales]);

  return (
    <Box textAlign={'center'}>
      <Grid container spacing={3}>
        <Grid item md={3} sm={6} xs={12}>
          <Paper>
            <Box
              p={3}
              display={'flex'}
              alignItems={'center'}
              style={{ cursor: 'pointer' }}
              onClick={() => Router.push('/devices')}
            >
              <Box ml={2}>
                <img src={TotalProducts} alt={'Total Devices'} />
              </Box>
              <Box
                ml={6}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
              >
                <Box fontSize={12} fontWeight={500} lineHeight={'18px'} color={'#B3A1B3'}>
                  Total Devices
                </Box>
                <Box
                  mt={2}
                  fontWeight={600}
                  fontSize={'24px'}
                  lineHeight={'36px'}
                  letterSpacing={'0.2px'}
                  color={'#333333'}
                >
                  {statistics?.totalDevices ? statistics?.totalDevices : 0}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Paper>
            <Box
              p={3}
              display={'flex'}
              alignItems={'center'}
              style={{ cursor: 'pointer' }}
              onClick={() => Router.push('/wallet')}
            >
              <Box ml={2}>
                <img src={TotalSales} alt={'TotalSales'} />
              </Box>
              <Box
                ml={6}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
              >
                <Box fontSize={12} fontWeight={500} lineHeight={'18px'} color={'#B3A1B3'}>
                  Total Sales(in Rs.)
                </Box>
                <Box
                  mt={2}
                  fontWeight={600}
                  fontSize={'24px'}
                  lineHeight={'36px'}
                  letterSpacing={'0.2px'}
                  color={'#333333'}
                >
                  {statistics?.totalSales ? statistics?.totalSales : 0}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Paper>
            <Box
              p={3}
              display={'flex'}
              alignItems={'center'}
              style={{ cursor: 'pointer' }}
              onClick={() => Router.push('/devices')}
            >
              <Box ml={2}>
                <img src={TotalActiveDevices} alt={'TotalActiveDevices'} />
              </Box>
              <Box
                ml={6}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
              >
                <Box fontSize={12} fontWeight={500} lineHeight={'18px'} color={'#B3A1B3'}>
                  Total Active Devices
                </Box>
                <Box
                  mt={2}
                  fontWeight={600}
                  fontSize={'24px'}
                  lineHeight={'36px'}
                  letterSpacing={'0.2px'}
                  color={'#333333'}
                >
                  {statistics?.totalActiveDevices ? statistics?.totalActiveDevices : 0}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={3} sm={6} xs={12}>
          <Paper>
            <Box
              p={3}
              display={'flex'}
              alignItems={'center'}
              style={{ cursor: 'pointer' }}
              onClick={() => Router.push('/devices')}
            >
              <Box ml={2}>
                <img src={TotalActiveHours} alt={'TotalActiveHours'} />
              </Box>
              <Box
                ml={6}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
              >
                <Box fontSize={12} fontWeight={500} lineHeight={'18px'} color={'#B3A1B3'}>
                  Total Active Hours
                </Box>
                <Box
                  mt={2}
                  fontWeight={600}
                  fontSize={'24px'}
                  lineHeight={'36px'}
                  letterSpacing={'0.2px'}
                  color={'#333333'}
                >
                  {statistics?.totalActiveHours ? statistics?.totalActiveHours : 0}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={2} />
      <Grid container spacing={3}>
        <Grid item md={5} sm={6} xs={12}>
          <Paper>
            <Box height={562}>
              <Box pt={4} pb={2} pl={4} pr={4} display={'flex'} justifyContent={'flex-start'}>
                <Typography className={classes.objectDetectedTypography}>Top Performing Products</Typography>
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
                  {'Transactions Made'}
                </Box>
              </Box>
              <Box maxHeight={430} className={classes.transactionWrapper}>
                {statistics?.topPerformingProducts.length > 0
                  ? statistics?.topPerformingProducts?.map((each) => (
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
                          {each?.totalTransactions && each?.totalTransactions}
                        </Box>
                      </Box>
                    ))
                  : 'No products found'}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item md={7} sm={6} xs={12}>
          <Paper>
            <Box pt={4} pb={4} pl={4} pr={4} width={'100%'} height={562}>
              <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
                <Typography className={classes.objectDetectedTypography}>Active Hours</Typography>
                <Box>
                  <FormControl>
                    <Select
                      input={<BootstrapInput />}
                      onChange={(e) => {
                        setSelectedProduct(e.target.value);
                      }}
                      value={selectedProduct}
                    >
                      <MenuItem value={'all'}>{'Device'}</MenuItem>
                      {productList?.map((each) => (
                        <MenuItem key={each?.id} value={each?.id}>
                          {each?.product?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <Select
                      input={<BootstrapInput />}
                      onChange={(e) => {
                        setActiveHours(e.target.value);
                      }}
                      value={activeHours}
                    >
                      <MenuItem value={'weekly'}>{'Weekly'}</MenuItem>
                      <MenuItem value={'monthly'}>{'Monthly'}</MenuItem>
                      <MenuItem value={'yearly'}>{'Yearly'}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box mt={3} height={166}>
                {activeHoursStatistics && <Line legend={false} height={166} data={activeHoursLineGraph} />}
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
              <Box ml={1} fontSize={16} fontWeight={500} lineHeight={'18.96px'} letterSpacing={'0.2px'}>
                Sales
              </Box>
            </Box>
            <Box>
              <FormControl>
                <Select
                  input={<BootstrapInput />}
                  onChange={(e) => {
                    setSelectedProductForSales(e.target.value);
                  }}
                  value={selectedProductForSales}
                >
                  <MenuItem value={'all'}>{'Device'}</MenuItem>
                  {productList?.map((each) => (
                    <MenuItem key={each?.id} value={each?.id}>
                      {each?.product?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          <Box mt={6} />
          {/*<Grid container spacing={2} style={{ marginLeft: 40 }}>*/}
          {/*  <Grid item md={11} sm={11} xs={12}>*/}
          <Box height={108}>
            {salesReportStatistics && <Line legend={false} height={88} data={totalSalesMadeGraph} />}
          </Box>
          {/*  </Grid>*/}
          {/*</Grid>*/}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
