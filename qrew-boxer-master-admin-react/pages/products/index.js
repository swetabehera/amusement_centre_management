 

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useUser } from '../../src/store/UserContext';
import { MasterProductService } from '../../src/apis/rest.app';
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
import AddEditDialog from '../../src/page-components/AllProducts/AddEditDialog';
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

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = () => {
    setWaiting(true);
    const query = {
      $sort: {
        createdAt: -1,
      },
      $skip: products.length,
      name: {
        $like: `%${searchQuery}%`,
      },
    };
    MasterProductService.find({
      query,
    })
      .then((res) => {
        let _products = res.data;
        setProducts([...products, ..._products]);
        setHasMore(products?.length < res.total);
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
    let _products = products;
    if (edited) {
      _products[_products.indexOf(product)] = data;
      setProducts([..._products]);
    } else {
      let _data;
      _data = data;
      setProducts([_data, ..._products]);
    }
    setOpen(false);
  };

  const handleDelete = (product, position) => {
    Confirm('Are you sure?', 'Do you really want to delete this Product?', 'Yes, Sure')
      .then(async () => {
        await MasterProductService.remove(product?.id)
          .then(() => {
            let _products = products;
            _products.splice(position, 1);
            setProducts([..._products]);
            enqueueSnackbar('Successfully Deleted', {
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
        <Typography variant={'h4'}>All Products</Typography>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'15%'}>
          <SearchAutoComplete
            setHasMore={setHasMore}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setList={setProducts}
            placeholder={'Search by name'}
          />
          <SearchIcon className={classes.searchIcon} />
        </Box>
        <Button
          variant="contained"
          color="secondary"
          className={classes.addButton}
          onClick={() => {
            setProduct(null);
            setOpen(true);
          }}
        >
          + New Product
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
        loadMore={loadProducts}
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
              ) : products?.length > 0 ? (
                products?.map((row, position) => (
                  <TableRow key={row._id}>
                    <TableCell component="th" scope="row">
                      {position + 1}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell style={{ maxWidth: 500 }}>{row.description}</TableCell>
                    <TableCell>{moment(row.createdAt).format('Do MMMM YYYY')}</TableCell>
                    <TableCell>
                      <Button variant={'contained'} onClick={() => Router.push('/products/' + row?.id)}>
                        {'View Details'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box display={'flex'}>
                        <IconButton
                          aria-label="edit"
                          onClick={() => {
                            setProduct(row);
                            setOpen(true);
                          }}
                        >
                          <Edit color={'primary'} />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={() => handleDelete(row, position)}>
                          <Delete color={'primary'} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : !hasMore ? (
                <Box mt={1} mb={1} ml={2} textAlign={'left'}>
                  {'No Products Found'}
                </Box>
              ) : (
                ''
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </InfiniteScroll>
      <AddEditDialog open={open} setOpen={setOpen} handleSave={handleSave} productDetails={product} />
    </div>
  );
};

export default Index;
