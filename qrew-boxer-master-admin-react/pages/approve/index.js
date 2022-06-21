import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import ApprovePayment from '../../public/ApprovePayment.svg';
import ApprovedImage from '../../public/ApprovedImage.svg';
import ApproveRejectedImage from '../../public/ApproveRejectedImage.svg';
import { CommissionApproveRequests } from '../../src/apis/rest.app';
import { useSnackbar } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CircularProgress } from '@material-ui/core';
import InfiniteScroll from '../../src/components/InfiniteScroll';
import moment from 'moment';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';

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

const Approve = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [requestsList, setRequestsList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadRequests = () => {
    CommissionApproveRequests.find({
      query: {
        $eager: '[client]',
        status: {
          $in: [1, 2, 3],
        },
        $sort: {
          createdAt: -1,
        },
        $skip: requestsList.length,
      },
    })
      .then((res) => {
        setRequestsList([...requestsList, ...res.data]);
        setHasMore(requestsList.length < res.total);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  };

  return (
    <Box>
      <Box>Approve Payment</Box>
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
          {requestsList.length > 0 ? (
            requestsList?.map((each, index) => (
              <Box
                mt={4}
                key={each?.id}
                p={3}
                bgcolor={'#fff'}
                borderRadius={'5px'}
                boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                width={'100%'}
              >
                <Box display={'flex'} alignItems={'center'} width={'100%'}>
                  <img src={ApprovePayment} width={50} height={50} alt={'Approve Payment'} />
                  <Box
                    ml={3}
                    fontWeight={400}
                    fontSize={14}
                    lineHeight={'22.4px'}
                    letterSpacing={'0.005em'}
                    color={'#333333'}
                    minWidth={600}
                    maxWidth={800}
                  >
                    {`Commission sent approval request from ${each?.client?.name} for Rs. ${each?.amount}.00`}
                  </Box>
                  <Box
                    ml={4}
                    fontWeight={500}
                    fontSize={12}
                    lineHeight={'160%'}
                    letterSpacing={'0.005em'}
                    color={'#787878'}
                  >
                    {moment(each?.createdAt).format('Do MMMM YYYY')}
                  </Box>
                </Box>
                <Box display={'flex'} alignItems={'center'}>
                  {each?.status === 2 && (
                    <>
                      <img src={ApprovedImage} alt={'ApprovedImage'} />
                      <Box ml={2} fontWeight={500} fontSize={14} lineHeight={'21px'} color={'#00B359'}>
                        Approved
                      </Box>
                    </>
                  )}
                  {each?.status === 1 && (
                    <>
                      <IconButton
                        onClick={() => {
                          CommissionApproveRequests.patch(
                            each?.id,
                            {
                              status: 3,
                            },
                            {
                              query: {
                                $eager: '[client]',
                              },
                            },
                          )
                            .then((res) => {
                              let _requestsList = requestsList;
                              _requestsList[index] = res;
                              setRequestsList([..._requestsList]);
                              enqueueSnackbar('Request Rejected', {
                                variant: 'success',
                              });
                            })
                            .catch((e) => {
                              enqueueSnackbar(e ? e.message : 'Something went wrong', {
                                variant: 'error',
                              });
                            });
                        }}
                      >
                        <CloseIcon style={{ color: '#D90024' }} />
                      </IconButton>
                      <Box ml={5} />
                      <IconButton
                        onClick={() => {
                          CommissionApproveRequests.patch(
                            each?.id,
                            {
                              status: 2,
                            },
                            {
                              query: {
                                $eager: '[client]',
                              },
                            },
                          )
                            .then((res) => {
                              let _requestsList = requestsList;
                              _requestsList[index] = res;
                              setRequestsList([..._requestsList]);
                              enqueueSnackbar('Request Accepted', {
                                variant: 'success',
                              });
                            })
                            .catch((e) => {
                              enqueueSnackbar(e ? e.message : 'Something went wrong', {
                                variant: 'error',
                              });
                            });
                        }}
                      >
                        <CheckIcon style={{ color: '#00B359' }} />
                      </IconButton>
                    </>
                  )}
                  {each?.status === 3 && (
                    <>
                      <img src={ApproveRejectedImage} alt={'ApproveRejectedImage'} />
                      <Box ml={2} fontWeight={500} fontSize={14} lineHeight={'21px'} color={'#B2A1B2'}>
                        Rejected
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            ))
          ) : !hasMore ? (
            <Box textAlign={'center'} mt={1} mb={1}>
              {'No Requests found'}
            </Box>
          ) : (
            ''
          )}
        </Box>
      </InfiniteScroll>
    </Box>
  );
};

export default Approve;
