 

import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import WalletImage from '../../public/Wallet.svg';
import Button from '@material-ui/core/Button';
import theme from '../../src/theme';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { CircularProgress, Divider, TableCell } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import { useSnackbar } from 'notistack';
import {
  CommissionApproveRequestService,
  GetCommissionValueService,
  TransactionService,
  WalletService,
} from '../../src/apis/rest.app';
import { useUser } from '../../src/store/UserContext';
import InfiniteScroll from '../../src/components/InfiniteScroll';
import moment from 'moment';
import RequestSent from '../../public/RequestSent.svg';
import QrewShareIcon from '../../public/QrewShareIcon.svg';
import ShowDetailsIcon from '../../public/ShowDetailsIcon.svg';
import HideDetailsIcon from '../../public/HideDetailsIcon.svg';
import clsx from 'clsx';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyle = makeStyles(() => ({
  productNameTitle: {
    color: '#818181',
  },
  commissionButton: {
    padding: '10px 40px',
    width: 340,
    borderRadius: '6px',
    boxShadow: '0px 6px 15px rgba(51, 5, 51, 0.2), inset 10px 10px 20px rgba(88, 46, 88, 0.7)',
    // '&:hover, &:focus': {
    //   background: '#fff',
    //   boxShadow: 'none',
    //   color: theme().palette.primary.main,
    //   border: `1px solid ${theme().palette.primary.main}`,
    //   padding: '9.5px 40px',
    //   width: 240,
    // },
  },
  RequestSentButton: {
    background: '#fff',
    boxShadow: 'none',
    color: theme().palette.primary.main,
    border: `1px solid ${theme().palette.primary.main}`,
    padding: '9.5px 40px',
    width: 240,
    '&:hover, &:focus': {
      background: '#fff',
      boxShadow: 'none',
      color: theme().palette.primary.main,
      border: `1px solid ${theme().palette.primary.main}`,
      padding: '9.5px 40px',
      width: 240,
    },
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
  showDetails: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '21px',
    letterSpacing: '0.2px',
    marginLeft: 17,
  },
}));

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, .03)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

const Index = () => {
  const classes = useStyle();
  const [user] = useUser();
  const [transactionList, setTransactionList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [wallet, setWallet] = useState([]);
  const [mouseEnter, setMouseEnter] = useState(false);
  const [requestSent, setRequestSent] = useState();
  const [commissionValues, setCommissionValues] = useState([]);

  const [expanded, setExpanded] = React.useState(false);

  const loadTransaction = () => {
    TransactionService.find({
      query: {
        clientId: user?.clients[0]?.id,
        $eager: '[clientProduct.[product]]',
        $sort: {
          createdAt: -1,
        },
        $skip: transactionList.length,
      },
    })
      .then((res) => {
        setTransactionList([...transactionList, ...res.data]);
        setHasMore(transactionList.length < res.total);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  };

  useEffect(() => {
    if (user?.clients[0]?.id) {
      WalletService.find({
        query: {
          clientId: user?.clients[0]?.id,
        },
      })
        .then((res) => {
          setWallet(res.data);
        })
        .catch((e) => {
          enqueueSnackbar(e ? e.message : 'Something went wrong', {
            variant: 'error',
          });
        });
    }
  }, []);

  useEffect(() => {
    CommissionApproveRequestService.find({
      query: {
        clientId: user?.clients[0]?.id,
        $sort: {
          createdAt: -1,
        },
      },
    })
      .then((res) => {
        setRequestSent(res.data[0]?.status === 1);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, []);

  useEffect(() => {
    GetCommissionValueService.create({
      clientId: user?.clients[0]?.id,
    })
      .then((res) => {
        setCommissionValues(res);
      })
      .catch((e) => {
        enqueueSnackbar(e ? e.message : 'Something went wrong', {
          variant: 'error',
        });
      });
  }, []);

  return (
    <>
      <Typography variant={'h6'} className={classes.productNameTitle}>
        {`Wallet`}
      </Typography>
      <Box
        mt={4}
        p={4}
        boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}
        display={'flex'}
        justifyContent={'space-between'}
        bgcolor={'#fff'}
        borderBottom={'1px solid #E5E5E5'}
        style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
      >
        <Box display={'flex'} alignItems={'center'}>
          <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
            <Box display={'flex'} alignItems={'center'}>
              <img src={WalletImage} alt={'Wallet'} />
              <Box ml={2} fontWeight={500} fontSize={16} lineHeight={'24px'} color={'#B3A1B3'}>
                Wallet Balance:
              </Box>
            </Box>
            <Box mt={1} fontWeight={600} fontSize={24} lineHeight={'36px'} color={'#333333'}>
              {wallet[0]?.amount && `Rs. ${wallet[0]?.amount}`}
            </Box>
          </Box>
          <Box ml={15} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
            <Box display={'flex'} alignItems={'center'}>
              <img src={QrewShareIcon} alt={'QrewShareIcon'} />
              <Box ml={2} fontWeight={500} fontSize={16} lineHeight={'24px'} color={'#B3A1B3'}>
                Qrew’s Share:
              </Box>
            </Box>
            <Box mt={1} fontWeight={600} fontSize={24} lineHeight={'36px'} color={'#333333'}>
              {commissionValues.length > 0
                ? `Rs. ${commissionValues?.map((each) => each?.totalCommission).reduce((a, b) => a + b, 0)}`
                : 'Rs. 0'}
            </Box>
          </Box>
        </Box>
        <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
          {requestSent === true || requestSent === false ? (
            <Button
              startIcon={requestSent === true ? <img src={RequestSent} alt={'Request Sent'} /> : ''}
              variant={'contained'}
              color={'primary'}
              className={clsx(classes.commissionButton, requestSent === true ? classes.RequestSentButton : '')}
              onMouseEnter={() => setMouseEnter(true)}
              onMouseLeave={() => setMouseEnter(false)}
              onClick={() => {
                if (requestSent === false) {
                  CommissionApproveRequestService.create({
                    clientId: user?.clients[0]?.id,
                  })
                    .then((res) => {
                      setRequestSent(res.status === 1);
                      enqueueSnackbar('Requests sent successfully', {
                        variant: 'success',
                      });
                    })
                    .catch((e) => {
                      enqueueSnackbar(e ? e.message : 'Something went wrong', {
                        variant: 'error',
                      });
                    });
                }
              }}
            >
              {requestSent === true ? 'Request Sent' : 'Send Commission Request'}
            </Button>
          ) : (
            ''
          )}
        </Box>
      </Box>
      <Accordion
        style={{ background: '#fff', border: 'none' }}
        expanded={expanded === true}
        onChange={() => {
          setExpanded(!expanded);
        }}
      >
        <AccordionSummary
          style={{ background: '#fff', borderBottom: expanded === true ? '0.1px solid #E5E5E5' : 'none' }}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Box display={'flex'} alignItems={'center'}>
            <Typography className={classes.showDetails}>
              {expanded === true ? 'Hide Details' : 'Show Details'}
            </Typography>
            <Box ml={1} display={'flex'} alignItems={'center'}>
              {expanded === true ? (
                <img src={HideDetailsIcon} alt={'HideDetailsIcon'} />
              ) : (
                <img src={ShowDetailsIcon} alt={'ShowDetailsIcon'} />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        {commissionValues?.map((each, i) => (
          <AccordionDetails
            key={i}
            style={{
              background: '#fff',
              width: '100%',
              borderBottom: i !== commissionValues.length - 1 && '0.1px solid #E5E5E5',
            }}
          >
            <Box display={'flex'} justifyContent={'space-between'} width={'65%'}>
              <Box ml={2} display={'flex'} alignItems={'center'}>
                <Box fontWeight={500} fontSize={14} lineHeight={'21px'} letterSpacing={'0.2px'}>
                  Device:
                </Box>
                <Box ml={1} fontWeight={600} fontSize={14} lineHeight={'21px'} letterSpacing={'0.2px'}>
                  {each?.productName && each?.productName}
                </Box>
              </Box>
              <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} width={'45%'}>
                <Box fontWeight={500} fontSize={14} lineHeight={'21px'} letterSpacing={'0.2px'} width={150}>
                  {`Commission(${each?.commissionPercentage && each?.commissionPercentage} %):`}
                </Box>
                <Box ml={1} fontWeight={600} fontSize={14} lineHeight={'21px'} letterSpacing={'0.2px'}>
                  {`Rs. ${each?.totalCommission && each?.totalCommission}`}
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        ))}
      </Accordion>
      <Box mt={4} />

      <InfiniteScroll
        hasMore={hasMore}
        loader={
          <Box align={'center'} p={1} key={'all transaction loader'}>
            <CircularProgress size={28} />
          </Box>
        }
        loadMore={loadTransaction}
        pageStart={0}
      >
        <Box height={503} className={classes.transactionWrapper}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" className={classes.tableRowCell}>
                    Transaction Id
                  </TableCell>
                  <TableCell align="center" className={classes.tableRowCell}>
                    Details
                  </TableCell>
                  <TableCell align="center" className={classes.tableRowCell}>
                    Amount
                  </TableCell>
                  <TableCell align="center" className={classes.tableRowCell}>
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactionList.length > 0 ? (
                  transactionList?.map((each) => (
                    <TableRow key={each?.id}>
                      <TableCell component="th" scope="row" align="center" className={classes.tableBodyCell}>
                        {each?.transactionId}
                      </TableCell>
                      <TableCell align="center" className={classes.tableBodyCell}>
                        {each?.type === 1 ? each?.clientProduct?.product?.name : 'Commission'}
                      </TableCell>
                      <TableCell align="center" className={classes.tableBodyCell}>
                        {each?.amount}
                      </TableCell>
                      <TableCell align="center" className={classes.tableBodyCell}>
                        {moment(each?.createdAt).format('DD/MM/YYYY, h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : !hasMore ? (
                  <Box textAlign={'center'} mt={1} mb={1}>
                    {'No transaction found'}
                  </Box>
                ) : (
                  ''
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </InfiniteScroll>
    </>
  );
};

export default Index;
