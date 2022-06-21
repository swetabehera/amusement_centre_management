 

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useUser } from '../../src/store/UserContext';
import { ClientProductService } from '../../src/apis/rest.app';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import { useConfirm } from '../../src/components/confirm';
import useHandleError from '../../src/hooks/useHandleError';
import UserTableSkeleton from '../../src/components/Skeleton/UserTableSkeleton';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import InfiniteScroll from '../../src/components/InfiniteScroll';

const useStyle = makeStyles((theme) => ({
  root: {
    borderRadius: '6px',
  },
  addButton: {
    marginRight: 10,
    padding: theme.spacing(1, 4),
  },
  table: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  searchIcon: {
    color: theme.palette.primary.main,
  },
}));

const Index = () => {
  const Router = useRouter();
  const [user] = useUser();
  const classes = useStyle();
  const Confirm = useConfirm();
  const handleError = useHandleError();
  const { enqueueSnackbar } = useSnackbar();

  const [deviceList, setDeviceList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [waiting, setWaiting] = useState(true);

  const loadClients = () => {
    if (user?.clients[0]?.id) {
      setWaiting(true);
      const query = {
        $eager: 'product',
        $sort: {
          createdAt: -1,
        },
        clientId: user?.clients[0]?.id,
        $skip: deviceList.length,
      };
      ClientProductService.find({
        query,
      })
        .then((res) => {
          let _admins = res.data;
          setDeviceList([...deviceList, ..._admins]);
          setHasMore(deviceList?.length < res.total);
        })
        .catch((err) => {
          enqueueSnackbar(err ? err.message : 'Something went wrong', {
            variant: 'error',
          });
        })
        .finally(() => {
          setWaiting(false);
        });
    }
  };

  return (
    <div className={classes.root}>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Typography variant={'h4'}>All Devices</Typography>
        {/*<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'15%'}>*/}
        {/*  <SearchAutoComplete*/}
        {/*    setHasMore={setHasMore}*/}
        {/*    searchQuery={searchQuery}*/}
        {/*    setSearchQuery={setSearchQuery}*/}
        {/*    setList={setAdmins}*/}
        {/*    placeholder={'Search by name'}*/}
        {/*  />*/}
        {/*  <SearchIcon className={classes.searchIcon} />*/}
        {/*</Box>*/}
        {/*<Button*/}
        {/*  variant="contained"*/}
        {/*  color="secondary"*/}
        {/*  className={classes.addButton}*/}
        {/*  onClick={() => {*/}
        {/*    setAdmin(null);*/}
        {/*    setOpen(true);*/}
        {/*  }}*/}
        {/*>*/}
        {/*  + New Admin*/}
        {/*</Button>*/}
      </Box>
      <InfiniteScroll
        hasMore={hasMore}
        loader={
          // <Box align={'center'} p={1} key={'all survey loader'}>
          //   <CircularProgress size={28} />
          // </Box>
          ''
        }
        loadMore={loadClients}
        pageStart={0}
      >
        <TableContainer component={Paper} className={classes.table}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Sl No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {waiting ? (
                <TableRow key={'loader'}>
                  <TableCell colSpan={7}>
                    <UserTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : deviceList?.length > 0 ? (
                deviceList?.map((row, position) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row">
                      {position + 1}
                    </TableCell>
                    <TableCell>{row?.product?.name}</TableCell>
                    <TableCell style={{ maxWidth: 500 }}>{row?.product?.description}</TableCell>
                    <TableCell>{moment(row.createdAt).format('Do MMMM YYYY')}</TableCell>
                    <TableCell>
                      <Button variant={'contained'} onClick={() => Router.push('/devices/' + row?.id)}>
                        {'View Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : !hasMore ? (
                <Box mt={1} mb={1} ml={2} textAlign={'left'}>
                  {'No Devices Found'}
                </Box>
              ) : (
                ''
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScroll>
    </div>
  );
};

export default Index;
