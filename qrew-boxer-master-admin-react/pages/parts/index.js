 

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useUser } from '../../src/store/UserContext';
import { MasterPartService } from '../../src/apis/rest.app';
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
import AddEditDialog from '../../src/page-components/AllParts/AddEditDialog';
import { useConfirm } from '../../src/components/confirm';
import useHandleError from '../../src/hooks/useHandleError';
import UserTableSkeleton from '../../src/components/Skeleton/UserTableSkeleton';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import InfiniteScroll from '../../src/components/InfiniteScroll';
import SearchAutoComplete from '../../src/components/SearchAutoComplete';
import SearchIcon from '@material-ui/icons/Search';

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

  const [parts, setParts] = useState([]);
  const [part, setPart] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClients = () => {
    setWaiting(true);
    const query = {
      $sort: {
        createdAt: -1,
      },
      $skip: parts.length,
      name: {
        $like: `%${searchQuery}%`,
      },
    };
    MasterPartService.find({
      query,
    })
      .then((res) => {
        let _parts = res.data;
        _parts = _parts.filter((e) => e.id !== user.id);
        setParts([...parts, ..._parts]);
        setHasMore(parts?.length < res.total);
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
    let _parts = parts;
    if (edited) {
      _parts[_parts.indexOf(part)] = data;
      setParts([..._parts]);
    } else {
      let _data;
      _data = data;
      setParts([_data, ..._parts]);
    }
    setOpen(false);
  };

  const handleDelete = (part) => {
    Confirm('Are you sure?', 'Do you really want to delete this Part ?', 'Yes, Sure')
      .then(async () => {
        await MasterPartService.remove(part?.id)
          .then(() => {
            let _parts = parts;
            _parts.splice(_parts.indexOf(part), 1);
            setParts([..._parts]);
            enqueueSnackbar('Part Deleted Successfully', {
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
        <Typography variant={'h4'}>All Parts</Typography>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'15%'}>
          <SearchAutoComplete
            setHasMore={setHasMore}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setList={setParts}
            placeholder={'Search by name'}
          />
          <SearchIcon className={classes.searchIcon} />
        </Box>
        <Button
          variant="contained"
          color="secondary"
          className={classes.addButton}
          onClick={() => {
            setPart(null);
            setOpen(true);
          }}
        >
          + New Part
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
                <TableCell>Description</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell />
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waiting ? (
                <TableRow key={'loader'}>
                  <TableCell colSpan={7}>
                    <UserTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : parts?.length > 0 ? (
                parts?.map((row, position) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row">
                      {position + 1}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell style={{ maxWidth: 500 }}>{row.description}</TableCell>
                    <TableCell>{moment(row.createdAt).format('Do MMMM YYYY')}</TableCell>
                    <TableCell>
                      <Button variant={'contained'} onClick={() => Router.push('/parts/' + row?.id)}>
                        {'View Details'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box display={'flex'}>
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
                            setPart(row);
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
                  {'No Parts Found'}
                </Box>
              ) : (
                ''
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScroll>
      <AddEditDialog open={open} setOpen={setOpen} handleSave={handleSave} part={part} />
    </div>
  );
};

export default Index;
