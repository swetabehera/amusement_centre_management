import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { CircularProgress, Switch } from '@material-ui/core';
import { useRouter } from 'next/router';
import { ClientProductService, ClientService } from '../../../src/apis/rest.app';
import { useSnackbar } from 'notistack';
import SideAdminDetailsPanel from '../../../src/page-components/AllAdmins/SideAdminDetailsPanel';
import AllDeviceComponent from '../../../src/page-components/AllAdmins/AllDeviceComponent';
import TransactionComponent from '../../../src/page-components/AllAdmins/TransactionComponent';
import InfiniteScroll from '../../../src/components/InfiniteScroll';
import Button from '@material-ui/core/Button';
import AddEditDeviceDialog from '../../../src/page-components/AllAdmins/AddEditDeviceDialog';
import AddEditAttachmentDialog from '../../../src/page-components/AllAdmins/AddEditAttachmentDialog';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import theme from '../../../src/theme';
import DeviceLogComponent from '../../../src/page-components/AllAdmins/DeviceLogComponent';
import ProductDetailsComponent from '../../../src/page-components/AllAdmins/ProductDetailsComponent';
import withStyles from '@material-ui/core/styles/withStyles';

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
  allDevicesWrapper: {
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

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const AdminDetails = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const Router = useRouter();
  const { id } = Router.query;
  const [adminDetails, setAdminDetails] = useState();
  const [switchComponent, setSwitchComponent] = useState('Devices');
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devicesHasMore, setDevicesHasMore] = useState(true);
  const [deviceList, setDeviceList] = useState([]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [openDeviceDialog, setOpenDeviceDialog] = useState(false);
  const [position, setPosition] = useState();
  const [openAddEditAttachmentDialog, setOpenAddEditAttachmentDialog] = useState(false);
  const [activeStep, setActiveStep] = React.useState(0);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      ClientService.get(id, {
        query: {
          $eager: '[owner, wallet]',
        },
      })
        .then((res) => {
          setAdminDetails(res);
        })
        .catch((e) => {
          enqueueSnackbar(e ? e.message : 'Something went wrong', {
            variant: 'error',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const loadDevices = () => {
    ClientProductService.find({
      query: {
        clientId: id,
        $sort: {
          createdAt: -1,
        },
        $eager: 'product',
        $skip: deviceList.length,
      },
    })
      .then((res) => {
        setDeviceList([...deviceList, ...res.data]);
        setDevicesHasMore(deviceList.length < res.total);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  };

  return (
    <>
      {loading ? (
        <Box textAlign={'center'}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <>
          {productDetails === null ? (
            <>
              <Box mb={4} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography variant={'h6'} className={classes.productNameTitle}>
                  Admin/Admin Name
                </Typography>
                {switchComponent !== 'Transaction' && (
                  <Button variant={'contained'} color={'primary'} onClick={() => setOpen(true)}>
                    Add Devices
                  </Button>
                )}

                <AddEditDeviceDialog
                  setDeviceList={setDeviceList}
                  deviceList={deviceList}
                  open={open}
                  setOpen={setOpen}
                  id={id}
                />
              </Box>
              <Grid container spacing={4}>
                <Grid item md={4} sm={6} xs={12}>
                  <SideAdminDetailsPanel
                    adminDetails={adminDetails}
                    setAdminDetails={setAdminDetails}
                    switchComponent={switchComponent}
                    setSwitchComponent={setSwitchComponent}
                    clientId={id}
                  />
                </Grid>
                <Grid item md={8} sm={6} xs={12}>
                  {switchComponent === 'Devices' && (
                    <InfiniteScroll
                      hasMore={devicesHasMore}
                      loader={
                        <Box align={'center'} p={1} key={'all device loader'}>
                          <CircularProgress size={28} />
                        </Box>
                      }
                      loadMore={loadDevices}
                      pageStart={0}
                    >
                      <Box height={500} className={classes.allDevicesWrapper}>
                        {deviceList?.length > 0 ? (
                          deviceList?.map((each, index) => (
                            <AllDeviceComponent
                              key={each?.id}
                              each={each}
                              index={index}
                              setProductDetails={setProductDetails}
                              setPosition={setPosition}
                              deviceList={deviceList}
                              setDeviceList={setDeviceList}
                            />
                          ))
                        ) : !devicesHasMore ? (
                          <Box mt={1} mb={1} ml={2} textAlign={'left'}>
                            {'No Devices Found'}
                          </Box>
                        ) : (
                          ''
                        )}
                      </Box>
                    </InfiniteScroll>
                  )}
                  {switchComponent === 'Transaction' && <TransactionComponent id={id} />}
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Box mb={3} style={{ cursor: 'pointer' }} onClick={() => setProductDetails(null)}>
                GO Back
              </Box>
              <Typography variant={'h6'} className={classes.productNameTitle}>
                {`${adminDetails?.name}/${productDetails?.product?.name}`}
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
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={`ab${index}`}>
                        {Math.abs(activeStep - index) <= 2 ? (
                          <img width={'100%'} height={600} src={img} alt={''} />
                        ) : null}
                      </div>
                    ))}
                  </AutoPlaySwipeableViews>
                )}
              </Box>
              <ProductDetailsComponent
                setProductDetails={setProductDetails}
                setOpenDeviceDialog={setOpenDeviceDialog}
                setData={setData}
                openDeviceDialog={openDeviceDialog}
                data={data}
                productDetails={productDetails}
                position={position}
                deviceList={deviceList}
                setDeviceList={setDeviceList}
                setOpenAddEditAttachmentDialog={setOpenAddEditAttachmentDialog}
              />
              <DeviceLogComponent productDetails={productDetails} />
            </>
          )}
        </>
      )}
      <AddEditAttachmentDialog
        openAddEditAttachmentDialog={openAddEditAttachmentDialog}
        setOpenAddEditAttachmentDialog={setOpenAddEditAttachmentDialog}
        productDetails={productDetails}
        setProductDetails={setProductDetails}
      />
    </>
  );
};

export default AdminDetails;
