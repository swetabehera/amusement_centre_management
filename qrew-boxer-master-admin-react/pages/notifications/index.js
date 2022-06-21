import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Notification1 from '../../public/Notification1.svg';
import Notification2 from '../../public/Notification2.svg';
import Notification3 from '../../public/Notification3.svg';
import Notification4 from '../../public/Notification4.svg';
import Notification5 from '../../public/Notification5.svg';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSnackbar } from 'notistack';
import { CircularProgress } from '@material-ui/core';
import InfiniteScroll from '../../src/components/InfiniteScroll';
import { NotificationService } from '../../src/apis/rest.app';
import moment from 'moment';

const useStyles = makeStyles(() => ({
  requestsWrapper: {
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

const Notification = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [notificationList, setNotificationList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadRequests = () => {
    NotificationService.find({
      query: {
        $sort: {
          createdAt: -1,
        },
        masterAdminNotification: 1,
        $skip: notificationList.length,
      },
    })
      .then((res) => {
        setNotificationList([...notificationList, ...res.data]);
        setHasMore(notificationList.length < res.total);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  };

  return (
    <Box>
      <Box>Notifications</Box>
      <InfiniteScroll
        hasMore={hasMore}
        loader={
          <Box align={'center'} p={1} key={'all requests loader'}>
            <CircularProgress size={28} />
          </Box>
        }
        loadMore={loadRequests}
        pageStart={0}
      >
        <Box mt={4} maxHeight={555} className={classes.requestsWrapper}>
          {notificationList.length > 0 ? (
            notificationList?.map((each, index) => (
              <Box
                key={each?.id}
                mt={4}
                p={3}
                bgcolor={'#fff'}
                borderRadius={'5px'}
                boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Box display={'flex'} alignItems={'center'}>
                  <img src={each?.icon} width={50} height={50} alt={'Icon'} />
                  <Box
                    ml={3}
                    fontWeight={400}
                    fontSize={14}
                    lineHeight={'22.4px'}
                    letterSpacing={'0.005em'}
                    color={'#333333'}
                  >
                    {each?.text ? each?.text : ''}
                  </Box>
                </Box>
                <Box fontWeight={500} fontSize={14} lineHeight={'22.4px'} letterSpacing={'0.005em'}>
                  {moment(each?.createdAt).format('Do MMMM YYYY, h:mm a')}
                </Box>
              </Box>
            ))
          ) : !hasMore ? (
            <Box textAlign={'center'} mt={1} mb={1}>
              {'No Notifications found'}
            </Box>
          ) : (
            ''
          )}
          {/*<Box*/}
          {/*  mt={3}*/}
          {/*  p={3}*/}
          {/*  bgcolor={'#fff'}*/}
          {/*  borderRadius={'5px'}*/}
          {/*  boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}*/}
          {/*  display={'flex'}*/}
          {/*  justifyContent={'space-between'}*/}
          {/*  alignItems={'center'}*/}
          {/*>*/}
          {/*  <Box display={'flex'} alignItems={'center'}>*/}
          {/*    <img src={Notification2} width={50} height={50} alt={'Device Added'} />*/}
          {/*    <Box*/}
          {/*      ml={3}*/}
          {/*      fontWeight={400}*/}
          {/*      fontSize={14}*/}
          {/*      lineHeight={'22.4px'}*/}
          {/*      letterSpacing={'0.005em'}*/}
          {/*      color={'#333333'}*/}
          {/*    >*/}
          {/*      AdminNames’ DeviceName is offline for more than 10 hrs now.*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*  <Box fontWeight={500} fontSize={14} lineHeight={'22.4px'} letterSpacing={'0.005em'}>*/}
          {/*    12th Jan 2022*/}
          {/*  </Box>*/}
          {/*</Box>*/}
          {/*<Box*/}
          {/*  mt={3}*/}
          {/*  p={3}*/}
          {/*  bgcolor={'#fff'}*/}
          {/*  borderRadius={'5px'}*/}
          {/*  boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}*/}
          {/*  display={'flex'}*/}
          {/*  justifyContent={'space-between'}*/}
          {/*  alignItems={'center'}*/}
          {/*>*/}
          {/*  <Box display={'flex'} alignItems={'center'}>*/}
          {/*    <img src={Notification3} width={50} height={50} alt={'Device Added'} />*/}
          {/*    <Box*/}
          {/*      ml={3}*/}
          {/*      fontWeight={400}*/}
          {/*      fontSize={14}*/}
          {/*      lineHeight={'22.4px'}*/}
          {/*      letterSpacing={'0.005em'}*/}
          {/*      color={'#333333'}*/}
          {/*    >*/}
          {/*      Admin AdminName added successfully to the system*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*  <Box fontWeight={500} fontSize={14} lineHeight={'22.4px'} letterSpacing={'0.005em'}>*/}
          {/*    12th Jan 2022*/}
          {/*  </Box>*/}
          {/*</Box>*/}
          {/*<Box*/}
          {/*  mt={3}*/}
          {/*  p={3}*/}
          {/*  bgcolor={'#fff'}*/}
          {/*  borderRadius={'5px'}*/}
          {/*  boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}*/}
          {/*  display={'flex'}*/}
          {/*  justifyContent={'space-between'}*/}
          {/*  alignItems={'center'}*/}
          {/*>*/}
          {/*  <Box display={'flex'} alignItems={'center'}>*/}
          {/*    <img src={Notification4} width={50} height={50} alt={'Device Added'} />*/}
          {/*    <Box*/}
          {/*      ml={3}*/}
          {/*      fontWeight={400}*/}
          {/*      fontSize={14}*/}
          {/*      lineHeight={'22.4px'}*/}
          {/*      letterSpacing={'0.005em'}*/}
          {/*      color={'#333333'}*/}
          {/*    >*/}
          {/*      DeviceName details updated successfully.*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*  <Box fontWeight={500} fontSize={14} lineHeight={'22.4px'} letterSpacing={'0.005em'}>*/}
          {/*    12th Jan 2022*/}
          {/*  </Box>*/}
          {/*</Box>*/}
          {/*<Box*/}
          {/*  mt={3}*/}
          {/*  p={3}*/}
          {/*  bgcolor={'#fff'}*/}
          {/*  borderRadius={'5px'}*/}
          {/*  boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}*/}
          {/*  display={'flex'}*/}
          {/*  justifyContent={'space-between'}*/}
          {/*  alignItems={'center'}*/}
          {/*>*/}
          {/*  <Box display={'flex'} alignItems={'center'}>*/}
          {/*    <img src={Notification5} width={50} height={50} alt={'Device Added'} />*/}
          {/*    <Box*/}
          {/*      ml={3}*/}
          {/*      fontWeight={400}*/}
          {/*      fontSize={14}*/}
          {/*      lineHeight={'22.4px'}*/}
          {/*      letterSpacing={'0.005em'}*/}
          {/*      color={'#333333'}*/}
          {/*    >*/}
          {/*      The amount Rs. 3092 is successfully withdrawn.*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*  <Box fontWeight={500} fontSize={14} lineHeight={'22.4px'} letterSpacing={'0.005em'}>*/}
          {/*    12th Jan 2022*/}
          {/*  </Box>*/}
          {/*</Box>*/}
        </Box>
      </InfiniteScroll>
    </Box>
  );
};

export default Notification;
