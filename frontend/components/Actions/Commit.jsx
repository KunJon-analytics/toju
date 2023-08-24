import React from "react";
import { formatEther, parseEther } from "viem";
import {
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  AlertDialog,
  FormControl,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  useColorModeValue,
  FormErrorMessage,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertDialogOverlay,
  useDisclosure,
  Input,
  FormLabel,
} from "@chakra-ui/react";

import { tokenConfig, tojuConfig } from "../contract";

const Commit = ({ project, id, allowance, balance }) => {
  const [isPending, setIsPending] = React.useState(false);
  const handleCommit = async (values) => {
    const commit = parseEther(String(values.amount));
    if (balance < commit) {
      toast.error(
        `Your TOJU balance: (${formatEther(balance)}) is less than support`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      return;
    }
    if (allowance < commit) {
      toast.error(
        `Your TOJU allowance: (${formatEther(allowance)}) is less than support`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      return;
    }
    setIsPending(true);
    const { request } = await prepareWriteContract({
      ...tojuConfig,
      functionName: "onPayment",
      args: [commit, parseInt(id)],
    });
    const { hash } = await writeContract(request);
    const data = await waitForTransaction({
      hash,
    });
    if (data.status === "success") {
      onClose();
    } else {
      toast.error(`Tx reverted`, {
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
    setIsPending(false);
  };
  const PaySchema = yup.object().shape({
    amount: yup
      .number()
      .positive("Amount must be positive")
      .max(
        formatEther(project.remainTokenCount),
        `Amount must not exceed ${formatEther(project.remainTokenCount)} TOJU`
      )
      .required("Amount is required"),
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const formik = useFormik({
    initialValues: {
      amount: 1,
    },
    onSubmit: handleCommit,
    validationSchema: PaySchema,
  });

  const {
    config: approveConfig,
    error: approvePrepareError,
    isError: isApprovePrepareError,
  } = usePrepareContractWrite({
    ...tokenConfig,
    functionName: "approve",
    args: [tojuConfig.address, parseEther(String(formik.values.amount))],
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
        Support
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Support Project
            </AlertDialogHeader>

            <AlertDialogBody>
              {(isApprovePrepareError || isApproveError) && (
                <Alert status={isApprovePrepareError ? "warning" : "error"}>
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Approve Error!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    {(approvePrepareError || approveError)?.message}
                  </AlertDescription>
                </Alert>
              )}
              {`You have approved ${formatEther(allowance)} TOJU to spend.`}
              <form onSubmit={formik.handleSubmit}>
                <FormControl isInvalid={!!formik.errors.amount}>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    isInvalid={!!formik.errors.amount && formik.touched.amount}
                    onChange={formik.handleChange}
                    value={formik.values.amount}
                  />
                  {!!formik.errors.amount && (
                    <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
                  )}
                </FormControl>

                <Button
                  isDisabled={
                    parseInt(allowance) < formik.values.amount || isPending
                  }
                  w="100%"
                  type="submit"
                  mt={8}
                  colorScheme="green"
                >
                  {isPending ? `Supporting` : `Support`}
                </Button>
              </form>

              {isApproveSuccess && (
                <Alert status="success" mt={4}>
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Approval Success!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    Your tx was successful
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              {parseInt(allowance) < formik.values.amount && (
                <Button
                  isDisabled={isApprovePending || isApprovePrepareError}
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
export default Commit;
