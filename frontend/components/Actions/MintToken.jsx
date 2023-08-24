import React from "react";
import {
  useContractWrite,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  Icon,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { RiCoinsLine } from "react-icons/ri";

import { tokenConfig } from "../contract";
import { parseEther } from "viem";

const MintToken = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    ...tokenConfig,
    functionName: "mint",
    value: parseEther("0.01"),
  });

  const { write, error, isError, data } = useContractWrite(config);

  const { isLoading: isPending, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <>
      <Button
        colorScheme="green"
        leftIcon={<Icon as={RiCoinsLine} fontSize="20" />}
        onClick={onOpen}
        textTransform={"uppercase"}
        _hover={{
          transform: "translateY(2px)",
          boxShadow: "lg",
        }}
      >
        Mint TOJU
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Mint TOJU
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
              {`Mint 1000 TOJU with 0.01 ETH`}
              {isSuccess && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Tx Success!</AlertTitle>
                  <AlertDescription color={"gray.700"}>
                    Your tx was successful
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button isDisabled={isPending} ref={cancelRef} onClick={onClose}>
                Back
              </Button>
              <Button
                isDisabled={isPending || isPrepareError}
                colorScheme="green"
                onClick={write}
                ml={3}
              >
                {isPending ? `Minting` : `Mint`}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
export default MintToken;
