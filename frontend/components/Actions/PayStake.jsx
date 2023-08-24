import React, { useEffect } from "react";
import { formatEther } from "viem";
import {
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  useColorModeValue,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import { tokenConfig, tojuConfig } from "../contract";

const PayStake = ({ project, id, allowance, balance }) => {
  const { stakeRate100, maxTokenSoldCount } = project;
  const ownerStake = (stakeRate100 * parseInt(maxTokenSoldCount)) / 100;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    if (parseInt(balance) < ownerStake) {
      toast.error("You have insufficient balance, please mint some TOJU", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [balance, ownerStake]);

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    ...tojuConfig,
    functionName: "onPayment",
    args: [ownerStake, parseInt(id)],
  });

  const { write, error, isError, data } = useContractWrite(config);

  const { isLoading: isPending, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const {
    config: approveConfig,
    error: approvePrepareError,
    isError: isApprovePrepareError,
  } = usePrepareContractWrite({
    ...tokenConfig,
    functionName: "approve",
    args: [tojuConfig.address, ownerStake],
  });

  const {
    write: approve,
    error: approveError,
    isError: isApproveError,
    data: approveData,
  } = useContractWrite(approveConfig);

  const { isLoading: isApprovePending, isSuccess: isApproveSuccess } =
    useWaitForTransaction({
      hash: approveData?.hash,
    });

  return (
    <>
      <Button
        colorScheme="green"
        onClick={onOpen}
        rounded={"none"}
        w={"full"}
        mt={8}
        size={"lg"}
        py={"7"}
        bg={useColorModeValue("gray.900", "gray.50")}
        color={useColorModeValue("white", "gray.900")}
        textTransform={"uppercase"}
        _hover={{
          transform: "translateY(2px)",
          boxShadow: "lg",
        }}
      >
        Pay Stake
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Pay Owner's Stake
            </AlertDialogHeader>

            <AlertDialogBody>
              {(isPrepareError || isError) && (
                <Alert status={isPrepareError ? "warning" : "error"}>
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Error!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    {(prepareError || error)?.message}
                  </AlertDescription>
                </Alert>
              )}
              {(isApprovePrepareError || isApproveError) && (
                <Alert status={isApprovePrepareError ? "warning" : "error"}>
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Approve Error!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    {(approvePrepareError || approveError)?.message}
                  </AlertDescription>
                </Alert>
              )}
              {`Pay ${formatEther(
                ownerStake
              )} TOJU to kickstart your project. You have approved ${formatEther(
                allowance
              )} TOJU to spend`}
              .
              {isApproveSuccess && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Approval Success!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    Your tx was successful
                  </AlertDescription>
                </Alert>
              )}
              {isSuccess && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Payment Success!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    Your tx was successful
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button isDisabled={isPending} ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              {parseInt(allowance) >= ownerStake ? (
                <Button
                  isDisabled={isPending || isError || isPrepareError}
                  colorScheme="green"
                  onClick={write}
                  ml={3}
                >
                  {isPending ? `Paying` : `Pay Stake`}
                </Button>
              ) : (
                <Button
                  isDisabled={
                    isApprovePending || isApproveError || isApprovePrepareError
                  }
                  colorScheme="green"
                  onClick={approve}
                  ml={3}
                >
                  {isApprovePending ? `Approving` : `Approve`}
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
export default PayStake;
