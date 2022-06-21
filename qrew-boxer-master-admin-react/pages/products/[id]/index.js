import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import EditPencil from '../../../public/EditPencilIcon.svg';
import DeleteIcon from '../../../public/DeleteIcon.svg';
import withStyles from '@material-ui/core/styles/withStyles';
import { CircularProgress, FormControlLabel, Switch } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useRouter } from 'next/router';
import { MasterProductPartService, MasterProductService } from '../../../src/apis/rest.app';
import { useSnackbar } from 'notistack';
import AddEditDialog from '../../../src/page-components/AllProducts/AddEditDialog';
import { useConfirm } from '../../../src/components/confirm';
import Button from '@material-ui/core/Button';
import AddEditPartDialog from '../../../src/page-components/AllProducts/AddEditPartDialog';

const useStyles = makeStyles(() => ({
  productNameTitle: {
    color: '#818181',
  },
  productName: {
    color: '#330533',
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

const ProductDetails = () => {
  const classes = useStyles();
  const Confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const Router = useRouter();
  const { id } = Router.query;
  const [productDetails, setProductDetails] = useState();
  const [open, setOpen] = useState(false);
  const [openPartDialog, setOpenPartDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      MasterProductService.get(id, {
        query: {
          $eager: 'productParts.[part]',
          $modifyEager: {
            productParts: {
              status: 1,
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

  return (
    <>
      {loading ? (
        <Box textAlign={'center'}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <>
          <Typography variant={'h6'} className={classes.productNameTitle}>
            {`Products / ${productDetails?.name}`}
          </Typography>
          <Box
            mt={4}
            pl={4}
            pr={9}
            pt={5}
            pb={5}
            bgcolor={'#FFFFFF'}
            boxShadow={'0px 16px 39px rgba(0, 0, 0, 0.05)'}
            borderRadius={'5px'}
          >
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Box display={'flex'} alignItems={'center'}>
                <Typography variant={'h4'} className={classes.productName}>
                  {productDetails?.name}
                </Typography>
                <Box ml={6}>
                  <FormControlLabel
                    control={<AntSwitch color={'primary'} />}
                    label={''}
                    checked={productDetails?.status === 1}
                    onChange={() => {
                      MasterProductService.patch(
                        id,
                        {
                          status: productDetails?.status === 1 ? 2 : 1,
                        },
                        {
                          query: {
                            $eager: 'productParts.[part]',
                            $modifyEager: {
                              productParts: {
                                status: 1,
                              },
                            },
                          },
                        },
                      )
                        .then((res) => {
                          setProductDetails(res);
                          if (res.status === 1) {
                            enqueueSnackbar('Product Enabled', {
                              variant: 'success',
                            });
                          }
                          if (res.status === 2) {
                            enqueueSnackbar('Product Disabled', {
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
                </Box>
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                <Box mr={6}>
                  <IconButton onClick={() => setOpen(true)}>
                    <img src={EditPencil} alt={'Edit'} />
                  </IconButton>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => {
                      Confirm('Are you sure?', 'Do you really want to delete this Product?', 'Yes, Sure')
                        .then(async () => {
                          MasterProductService.remove(id)
                            .then(async () => {
                              await Router.push('/products');
                              enqueueSnackbar('Successfully Deleted', {
                                variant: 'success',
                              });
                            })
                            .catch((e) => {
                              enqueueSnackbar(e ? e.message : 'Something went wrong', {
                                variant: 'error',
                              });
                            });
                        })
                        .catch(() => {});
                    }}
                  >
                    <img src={DeleteIcon} alt={'Delete'} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            <Box mt={1}>
              <Typography variant={'h6'} className={classes.productNameTitle}>
                {productDetails?.remarks && productDetails?.remarks}
              </Typography>
            </Box>
            <Box mt={6}>
              <Box display={'flex'} alignItems={'center'}>
                <Box width={90}>
                  <Typography variant={'h6'} className={classes.productNameTitle}>
                    MRP:
                  </Typography>
                </Box>
                <Box width={200} fontWeight={500} fontSize={16} lineHeight={'24px'} color={'#00B359'}>
                  {`Rs. ${productDetails?.price}`}
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
                  lineHeight={'23px'}
                  fontWeight={400}
                  color={'#333333'}
                >
                  {productDetails?.description}
                </Box>
              </Box>
            </Box>
            <Box mt={6}>
              <Box display={'flex'} alignItems={'center'}>
                <Box flexGrow={1} fontWeight={500} fontSize={16} lineHeight={'24px'}>
                  Parts Used
                </Box>
                <Button
                  variant={'contained'}
                  color={'primary'}
                  onClick={() => {
                    setData(null);
                    setOpenPartDialog(true);
                  }}
                >
                  Add
                </Button>
                <AddEditPartDialog
                  productDetails={productDetails}
                  openPartDialog={openPartDialog}
                  setOpenPartDialog={setOpenPartDialog}
                  setProductDetails={setProductDetails}
                  data={data}
                  setData={setData}
                />
                <Box mr={15} />
              </Box>

              {productDetails?.productParts?.length > 0 ? (
                productDetails?.productParts?.map((each, index) => (
                  <Box key={each?.id} mt={3} display={'flex'} alignItems={'center'}>
                    <Box ml={3} width={300} display={'list-item'}>
                      <Typography variant={'h7'}>{each?.part?.name}</Typography>
                    </Box>
                    <Box width={300}>
                      <Typography variant={'h7'}>{each?.serialNumber}</Typography>
                    </Box>
                    <Box width={300}>
                      <Typography variant={'h7'}>{`Rs. ${each?.part?.price}`}</Typography>
                    </Box>
                    <Box ml={3} display={'flex'} alignItems={'center'}>
                      <Box mr={1}>
                        <IconButton
                          onClick={() => {
                            setData(each);
                            setOpenPartDialog(true);
                          }}
                        >
                          <img src={EditPencil} alt={'Edit'} />
                        </IconButton>
                      </Box>
                      <Box>
                        <IconButton
                          onClick={() => {
                            Confirm('Are you sure?', 'Do you really want to delete this Part ?', 'Yes, Sure')
                              .then(async () => {
                                MasterProductPartService.remove(each?.id)
                                  .then(() => {
                                    let _productParts = productDetails?.productParts;
                                    _productParts.splice(index, 1);
                                    setProductDetails({ ...productDetails, productParts: _productParts });
                                    enqueueSnackbar('Successfully Deleted', {
                                      variant: 'success',
                                    });
                                  })
                                  .catch((e) => {
                                    enqueueSnackbar(e ? e.message : 'Something went wrong', {
                                      variant: 'error',
                                    });
                                  });
                              })
                              .catch(() => {});
                          }}
                        >
                          <img src={DeleteIcon} alt={'Delete'} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box mt={3} display={'flex'} alignItems={'center'}>
                  {'No Parts found'}
                </Box>
              )}
            </Box>
          </Box>
          <AddEditDialog
            open={open}
            setOpen={setOpen}
            setProductDetails={setProductDetails}
            productDetails={productDetails}
            status={true}
          />
        </>
      )}
    </>
  );
};

export default ProductDetails;
