 

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ClientService, NotificationService } from '../../src/apis/rest.app';
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
import IconButton from '@material-ui/core/IconButton';
import { Delete, Edit } from '@material-ui/icons';
import AddEditAdminDialog from '../../src/page-components/AllAdmins/AddEditAdminDialog';
import { useConfirm } from '../../src/components/confirm';
import useHandleError from '../../src/hooks/useHandleError';
import UserTableSkeleton from '../../src/components/Skeleton/UserTableSkeleton';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import InfiniteScroll from '../../src/components/InfiniteScroll';
import SearchAutoComplete from '../../src/components/SearchAutoComplete';
import SearchIcon from '@material-ui/icons/Search';
import { FormControlLabel, Switch } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import BuzzIcon from '../../public/BuzzIcon.svg';
import BuzzUnselected from '../../public/BuzzUnselected.svg';

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

const AntSwitch = withStyles(() => ({
  root: {
    width: 37,
    height: 17,
    padding: 0,
    display: 'flex',
    // borderRadius: 10,
  },
  switchBase: {
    padding: 2.5,
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

const Index = () => {
  const Router = useRouter();
  const classes = useStyle();
  const Confirm = useConfirm();
  const handleError = useHandleError();
  const { enqueueSnackbar } = useSnackbar();

  const [admins, setAdmins] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClients = () => {
    setWaiting(true);
    const query = {
      $eager: 'owner',
      $sort: {
        createdAt: -1,
      },
      $skip: admins.length,
      name: {
        $like: `%${searchQuery}%`,
      },
    };
    ClientService.find({
      query,
    })
      .then((res) => {
        let _admins = res.data;
        setAdmins([...admins, ..._admins]);
        setHasMore(admins?.length < res.total);
      })
      .catch((err) => {
        enqueueSnackbar(err ? err.message : 'Something went wrong', {
          variant: 'error',
        });
      })
      .finally(() => {
        setWaiting(false);
      });
  };

  const handleSave = (data, edited = false) => {
    let _admins = admins;
    if (edited) {
      _admins[_admins.indexOf(admin)] = data;
      setAdmins([..._admins]);
    } else {
      let _data;
      if (data?.password) {
        const { password, ...other } = data;
        _data = { ...other };
      } else {
        _data = data;
      }
      setAdmins([_data, ..._admins]);
    }
    setOpen(false);
  };

  const handleDelete = (admin) => {
    Confirm('Are you sure?', 'Do you really want to delete this Admin?', 'Yes, Sure')
      .then(async () => {
        await ClientService.remove(admin?.id)
          .then(() => {
            let _admins = admins;
            _admins.splice(_admins.indexOf(admin), 1);
            setAdmins([..._admins]);
            enqueueSnackbar('Admin Deleted Successfully', {
              variant: 'success',
            });
          })
          .catch((err) => {
            handleError()(err);
          })
          .finally(() => {
            setWaiting(false);
          });
      })
      .catch(() => {});
  };

  return (
    <div className={classes.root}>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Typography variant={'h4'}>All Admins</Typography>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'15%'}>
          <SearchAutoComplete
            setHasMore={setHasMore}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setList={setAdmins}
            placeholder={'Search by name'}
          />
          <SearchIcon className={classes.searchIcon} />
        </Box>
        <Button
          variant="contained"
          color="secondary"
          className={classes.addButton}
          onClick={() => {
            setAdmin(null);
            setOpen(true);
          }}
        >
          + New Admin
        </Button>
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
                <TableCell>Email</TableCell>
                <TableCell>Created At</TableCell>
                {/*<TableCell>Permissions</TableCell>*/}
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waiting ? (
                <TableRow key={'loader'}>
                  <TableCell colSpan={8}>
                    <UserTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : admins?.length > 0 ? (
                admins?.map((row, position) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row">
                      {position + 1}
                    </TableCell>
                    <TableCell>{row?.name}</TableCell>
                    <TableCell>{row?.owner?.email}</TableCell>
                    <TableCell>{moment(row.createdAt).format('Do MMMM YYYY')}</TableCell>
                    <TableCell>
                      <Button variant={'contained'} onClick={() => Router.push('/admins/' + row?.id)}>
                        {'View Details'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={<AntSwitch color={'primary'} />}
                        label={''}
                        checked={row?.status === 1}
                        onChange={() => {
                          ClientService.patch(
                            row?.id,
                            {
                              status: row?.status === 1 ? 2 : 1,
                            },
                            {
                              query: {
                                $eager: 'owner',
                              },
                            },
                          )
                            .then((res) => {
                              let _admins = admins;
                              _admins[position] = res;
                              setAdmins([..._admins]);
                              if (res.status === 1) {
                                enqueueSnackbar(`${row?.name} has been Unblocked`, {
                                  variant: 'success',
                                });
                              }
                              if (res.status === 2) {
                                enqueueSnackbar(`${row?.name} has been Blocked`, {
                                  variant: 'success',
                                });
                              }
                            })
                            .catch((e) => {
                              enqueueSnackbar(e ? e.message : 'Something went wrong', {
                                variant: 'error',
                              });
                            });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        disabled={
                          Math.abs(new Date(row?.lastBuzzedOn).getTime() - new Date().getTime()) / (60 * 60 * 1000) < 24
                        }
                        onClick={() => {
                          NotificationService.create({
                            clientId: row?.id,
                          })
                            .then((res) => {
                              let _admins = admins;
                              _admins[position].lastBuzzedOn = res.createdAt;
                              setAdmins([..._admins]);
                              enqueueSnackbar(`"${res.text}"` + ' notification has been sent', {
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
                        {Math.abs(new Date(row?.lastBuzzedOn).getTime() - new Date().getTime()) / (60 * 60 * 1000) <
                        24 ? (
                          <img src={BuzzUnselected} alt={'BuzzUnselected'} />
                        ) : (
                          <img src={BuzzIcon} alt={'BuzzIcon'} />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box display={'flex'}>
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
                            setAdmin(row);
                            setOpen(true);
                          }}
                        >
                          <Edit color={'primary'} />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => handleDelete(row)}>
                          <Delete color={'primary'} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : !hasMore ? (
                <Box mt={1} mb={1} ml={2} textAlign={'left'}>
                  {'No Admins Found'}
                </Box>
              ) : (
                ''
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScroll>
      <AddEditAdminDialog open={open} setOpen={setOpen} handleSave={handleSave} admin={admin} />
    </div>
  );
};

export default Index;
