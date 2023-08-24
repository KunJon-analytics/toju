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
  useColorModeValue,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import { tojuConfig } from "../contract";

const Cancel = ({ id }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    ...tojuConfig,
    functionName: "cancelProject",
    args: [parseInt(id)],
  });

  const { write, error, isError, data } = useContractWrite(config);

  const { isLoading: isPending, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
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
        bg={useColorModeValue("red.900", "red.50")}
        color={useColorModeValue("white", "gray.900")}
        textTransform={"uppercase"}
        _hover={{
          transform: "translateY(2px)",
          boxShadow: "lg",
        }}
      >
        Cancel Project
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Project
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
              {` Are you sure? You can't undo this action afterwards.`}
              {isSuccess && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle color={"gray.700"}>Cancel Success!</AlertTitle>
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
                {isPending ? `Cancelling` : `Cancel`}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
export default Cancel;
