import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CircularProgress, FormControlLabel, Switch, TableCell } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import { useRouter } from 'next/router';
import {
  ClientProductLogService,
  ClientProductService,
  DashboardSalesReportStatisticsService,
  GetCommissionValueService,
} from '../../../src/apis/rest.app';
import { useSnackbar } from 'notistack';
import { useUser } from '../../../src/store/UserContext';
import ViewAttachment from '../../../public/ViewAttachment.svg';
import AddCutomLogIcon from '../../../public/AddCutomLogIcon.svg';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import theme from '../../../src/theme';
import InfiniteScroll from '../../../src/components/InfiniteScroll';
import clsx from 'clsx';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import AddCustomLogDialog from '../../../src/page-components/devices/AddCustomLogDialog';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';

const useStyles = makeStyles(() => ({
  productNameTitle: {
    color: '#818181',
  },
  productName: {
    color: '#330533',
  },
  switchComponent: {
    cursor: 'pointer',
  },
  productDevicesRoot: {
    cursor: 'pointer',
  },
  tableRowCell: {
    fontSize: 14,
    lineHeight: '21px',
    fontWeight: 400,
    letterSpacing: '0.2px',
    color: '#868686',
  },
  tableBodyCell: {
    fontSize: 14,
    lineHeight: '21px',
    fontWeight: 400,
    letterSpacing: '0.2px',
    color: '#333333',
  },
  logWrapper: {
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

const AntSwitch = withStyles(() => ({
  root: {
    width: 37,
    height: 17,
    padding: 0,
    display: 'flex',
    // borderRadius: 10,
  },
  switchBase: {
    padding: 2,
    color: '#8B6D8B',
    '&$checked': {
      transform: 'translateX(19px)',
      color: '#fff',
      '& + $track': {
        opacity: 1,
        backgroundColor: '#7F0D7F',
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none',
  },
  track: {
    border: `2px solid #8B6D8B`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: '#fff',
  },
  checked: {},
}))(Switch);

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

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
    fontSize: 14,
    fontWeight: 400,
    color: theme?.palette?.primary?.main,
    padding: '4px 10px 4px 10px',
    transition: theme?.transitions?.create(['box-shadow']),
  },
}))(InputBase);

const AdminDetails = () => {
  const classes = useStyles();
  const [user] = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const Router = useRouter();
  const { id } = Router.query;
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState();
  const [activeStep, setActiveStep] = React.useState(0);
  const [openAddCustomLogDialog, setOpenAddCustomLogDialog] = useState(false);
  const [salesType, setSalesType] = useState('weekly');
  const [salesReportData, setSalesReportData] = useState();
  const [commissionValues, setCommissionValues] = useState([]);

  const [logList, setLogList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const loadLogList = () => {
    ClientProductLogService.find({
      query: {
        clientProductId: id,
        $sort: {
          createdAt: -1,
        },
        $skip: logList.length,
        clientId: user?.clients[0]?.id,
      },
    })
      .then((res) => {
        setLogList([...logList, ...res.data]);
        setHasMore(logList.length < res.total);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      ClientProductService.get(id, {
        query: {
          $eager: '[product, productParts.[part]]',
          clientId: user?.clients[0]?.id,
          $modifyEager: {
            productParts: {
              Status: 1,
            },
          },
        },
      })
        .then((res) => {
          setProductDetails(res);
        })
        .catch((e) => {
          enqueueSnackbar(e ? e.message : 'Something went wrong', {
            variant: 'error',
          });
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    DashboardSalesReportStatisticsService.create({
      salesReportInterval: salesType,
      clientId: user?.clients[0]?.id,
      clientProductId: id,
    })
      .then((res) => {
        setSalesReportData(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, [salesType]);

  useEffect(() => {
    GetCommissionValueService.create({
      clientId: user?.clients[0]?.id,
    })
      .then((res) => {
        setCommissionValues(res.filter((each) => each?.clientProductId?.toString() === id));
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, []);

  return (
    <>
      {loading ? (
        <Box textAlign={'center'}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <>
          <Typography variant={'h6'} className={classes.productNameTitle}>
            {`Devices/${productDetails?.product?.name}`}
          </Typography>
          <Box mt={4} bgcolor={'#FFFFFF'} boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'} borderRadius={'5px'}>
            {productDetails?.attachments && (
              // <img src={productDetails?.attachments[0]} width={'100%'} height={600} alt={''} />
              <AutoPlaySwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={activeStep}
                onChangeIndex={handleStepChange}
                enableMouseEvents
              >
                {productDetails?.attachments?.map((img, index) => (
                  <div key={index}>
                    {Math.abs(activeStep - index) <= 2 ? <img width={'100%'} height={600} src={img} alt={''} /> : null}
                  </div>
                ))}
              </AutoPlaySwipeableViews>
            )}
            <Box
              pl={4}
              pr={9}
              pt={5}
              pb={5}
              bgcolor={'#FFFFFF'}
              boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}
              borderRadius={'5px'}
            >
              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Box>
                  <Typography variant={'h4'} className={classes.productName}>
                    {productDetails?.product?.name}
                  </Typography>
                  <Box mt={1}>
                    <Box display={'flex'} alignItems={'center'}>
                      <Typography
                        variant={'h6'}
                        style={{ color: productDetails?.onlineStatus === 1 ? '#00B259' : '#D90024' }}
                      >
                        {productDetails?.onlineStatus === 1 ? 'Online' : 'Offline'}
                      </Typography>
                      <Box ml={5} />
                      <FormControlLabel
                        control={<AntSwitch color={'primary'} />}
                        label={''}
                        checked={productDetails?.onlineStatus === 1}
                        onChange={() => {
                          ClientProductService.patch(
                            id,
                            {
                              clientId: user?.clients[0]?.id,
                              onlineStatus: productDetails?.onlineStatus === 1 ? 2 : 1,
                            },
                            {
                              query: {
                                $eager: '[product, productParts.[part]]',
                                $modifyEager: {
                                  productParts: {
                                    Status: 1,
                                  },
                                },
                              },
                            },
                          )
                            .then((res) => {
                              setProductDetails(res);
                            })
                            .catch((e) => {
                              enqueueSnackbar(e ? e.message : 'Something went wrong', {
                                variant: 'error',
                              });
                            });
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box width={'45%'} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                  <Box>
                    <Box display={'flex'} alignItems={'center'}>
                      <Box fontSize={14} fontWeight={400} lineHeight={'21px'} color={'#333333'}>
                        Sales Made:-
                      </Box>
                      <Box>
                        <FormControl>
                          <Select
                            input={<BootstrapInput />}
                            onChange={(e) => {
                              setSalesType(e.target.value);
                            }}
                            value={salesType}
                          >
                            <MenuItem value={'weekly'}>{'This Weekly'}</MenuItem>
                            <MenuItem value={'monthly'}>{'This Monthly'}</MenuItem>
                            <MenuItem value={'yearly'}>{'This Yearly'}</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                    <Box mt={1} fontWeight={500} fontSize={16} lineHeight={'24px'}>
                      {salesReportData &&
                        Object.keys(salesReportData?.salesReport)
                          .map((each) => salesReportData?.salesReport[each])
                          .reduce((a, b) => a + b, 0)}
                    </Box>
                  </Box>

                  <Box ml={6}>
                    <Box fontSize={14} fontWeight={400} lineHeight={'21px'} color={'#333333'}>
                      {`Qrew’s Share:`}
                    </Box>
                    <Box mt={1} fontWeight={500} fontSize={16} lineHeight={'24px'}>
                      {commissionValues.length > 0
                        ? `Rs. ${commissionValues?.map((each) => each?.totalCommission).reduce((a, b) => a + b, 0)}`
                        : 'Rs. 0'}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box mt={6}>
                <Box display={'flex'} alignItems={'center'}>
                  <Box width={90}>
                    <Typography variant={'h6'} className={classes.productNameTitle}>
                      MRP:
                    </Typography>
                  </Box>
                  <Box width={200} fontWeight={500} fontSize={16} lineHeight={'24px'} color={'#00B359'}>
                    {`Rs. ${productDetails?.product?.price}`}
                  </Box>
                </Box>
              </Box>
              <Box mt={3}>
                <Box display={'flex'} alignItems={'flex-start'}>
                  <Box width={90}>
                    <Typography variant={'h6'} className={classes.productNameTitle}>
                      Details:
                    </Typography>
                  </Box>
                  <Box
                    width={1000}
                    textAlign={'left'}
                    fontSize={14}
                    lineHeight={'27px'}
                    fontWeight={400}
                    color={'#333333'}
                  >
                    {productDetails?.product?.description}
                  </Box>
                </Box>
              </Box>
              <Box mt={6}>
                <Box display={'flex'} alignItems={'center'}>
                  <Box flexGrow={1} fontWeight={500} fontSize={16} lineHeight={'24px'}>
                    Parts Used
                  </Box>
                </Box>
                {productDetails?.productParts?.map((each) => (
                  <Box key={each?.id} mt={3} display={'flex'} alignItems={'center'}>
                    <Box ml={3} width={300} display={'list-item'}>
                      <Typography variant={'h7'}>{each?.part?.name}</Typography>
                    </Box>
                    <Box width={300}>
                      <Typography variant={'h7'}>{each?.serialNumber}</Typography>
                    </Box>
                    <Box width={300}>
                      <Typography variant={'h7'}>{each?.part?.price}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Box mt={4} bgcolor={'#FFFFFF'} boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'} borderRadius={'5px'}>
            <Box pl={7} pt={3} pb={3} pr={7} display={'flex'} justifyContent={'space-between'}>
              <Box>Device Log</Box>
              <Box
                display={'flex'}
                alignItems={'center'}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setOpenAddCustomLogDialog(true);
                }}
              >
                <img src={AddCutomLogIcon} alt={'Custom Log'} />
                <Box ml={2} color={'#7F0D7F'}>
                  Add Custom log
                </Box>
              </Box>
              <AddCustomLogDialog
                openAddCustomLogDialog={openAddCustomLogDialog}
                setOpenAddCustomLogDialog={setOpenAddCustomLogDialog}
                clientProductId={id}
                logList={logList}
                setLogList={setLogList}
              />
            </Box>
            <InfiniteScroll
              hasMore={hasMore}
              loader={
                <Box align={'center'} p={1} key={'all log loader'}>
                  <CircularProgress size={28} />
                </Box>
              }
              loadMore={loadLogList}
              pageStart={0}
            >
              <Box maxHeight={500} className={clsx(logList?.length > 8 && classes.logWrapper)}>
                <TableContainer component={Paper}>
                  <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" className={classes.tableRowCell}>
                          Activity ID
                        </TableCell>
                        <TableCell align="left" className={classes.tableRowCell}>
                          Activity
                        </TableCell>
                        <TableCell align="center" className={classes.tableRowCell}>
                          Date & Time
                        </TableCell>
                        <TableCell align="center" className={classes.tableRowCell}>
                          Attachment
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logList?.length > 0 ? (
                        logList?.map((each) => (
                          <TableRow key={each?.id}>
                            <TableCell component="th" scope="row" align="center" className={classes.tableBodyCell}>
                              {each?.logId}
                            </TableCell>
                            <TableCell align="left" className={classes.tableBodyCell}>
                              {each?.title}
                            </TableCell>
                            <TableCell align="center" className={classes.tableBodyCell}>
                              {moment(each?.createdAt).format('DD/MM/YYYY, h:mm a')}
                            </TableCell>
                            {each?.attachments ? (
                              <TableCell align="center" className={classes.tableBodyCell}>
                                <Box
                                  display={'flex'}
                                  justifyContent={'center'}
                                  alignItems={'center'}
                                  onClick={() => {
                                    each?.attachments?.map((each) => window.open(each, '_blank'));
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <Typography className={classes.tableBodyCell} style={{ color: '#334193' }}>
                                    {'View'}
                                  </Typography>
                                  <Box ml={1} />
                                  <img src={ViewAttachment} alt={'Attachment'} />
                                </Box>
                              </TableCell>
                            ) : (
                              <TableCell align="center" className={classes.tableBodyCell} style={{ color: '#FF3E5E' }}>
                                {'No attachment'}
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : !hasMore ? (
                        <Box mt={1} mb={1} textAlign={'center'}>
                          {'No log found'}
                        </Box>
                      ) : (
                        ''
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </InfiniteScroll>
          </Box>
        </>
      )}
    </>
  );
};

export default AdminDetails;
