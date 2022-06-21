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
import { MasterPartService } from '../../../src/apis/rest.app';
import { useSnackbar } from 'notistack';
import AddEditDialog from '../../../src/page-components/AllParts/AddEditDialog';
import { useConfirm } from '../../../src/components/confirm';

const useStyles = makeStyles(() => ({
  productNameTitle: {
    color: '#818181',
  },
  productName: {
    color: '#330533',
  },
}));

const AntSwitch = withStyles((theme) => ({
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

const PartDetails = () => {
  const classes = useStyles();
  const Router = useRouter();
  const Confirm = useConfirm();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = Router.query;
  const [loading, setLoading] = useState(false);
  const [partDetails, setPartDetails] = useState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      MasterPartService.get(id)
        .then((res) => {
          setPartDetails(res);
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
            {`Parts / ${partDetails?.name}`}
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
                  {partDetails?.name}
                </Typography>
                <Box ml={6}>
                  <FormControlLabel
                    control={<AntSwitch color={'primary'} />}
                    label={''}
                    checked={partDetails?.status === 1}
                    onChange={() => {
                      MasterPartService.patch(id, {
                        status: partDetails?.status === 1 ? 2 : 1,
                      })
                        .then((res) => {
                          setPartDetails(res);
                          if (res.status === 1) {
                            enqueueSnackbar('Part Enabled', {
                              variant: 'success',
                            });
                          } else if (res.status === 2) {
                            enqueueSnackbar('Part Disabled', {
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
                      Confirm('Are you sure?', 'Do you really want to delete this Part ?', 'Yes, Sure')
                        .then(() => {
                          MasterPartService.remove(id)
                            .then(async () => {
                              await Router.push('/parts');
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
            <Box mt={6}>
              <Box display={'flex'} alignItems={'center'}>
                <Box width={90}>
                  <Typography variant={'h6'} className={classes.productNameTitle}>
                    MRP:
                  </Typography>
                </Box>
                <Box width={200} fontWeight={500} fontSize={16} lineHeight={'24px'} color={'#00B359'}>
                  {partDetails?.price}
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
                  {partDetails?.description}
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      )}
      <AddEditDialog open={open} setOpen={setOpen} part={partDetails} setPartDetails={setPartDetails} status={true} />
    </>
  );
};

export default PartDetails;
