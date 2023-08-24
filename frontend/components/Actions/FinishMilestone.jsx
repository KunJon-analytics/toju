import React from "react";
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
  AlertDialogOverlay,
  useDisclosure,
  Input,
  FormLabel,
} from "@chakra-ui/react";

import { tojuConfig } from "../contract";

const FinishMilestone = ({ id, milestoneIndex }) => {
  const [isPending, setIsPending] = React.useState(false);
  const handleFinishMilestone = async (values) => {
    setIsPending(true);
    const { request } = await prepareWriteContract({
      ...tojuConfig,
      functionName: "finishMilestone",
      args: [parseInt(id), parseInt(milestoneIndex), values.proofOfWork],
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
  const FinishMilestoneSchema = yup.object().shape({
    proofOfWork: yup
      .string()
      .max(300, `proof must not exceed 300 letters`)
      .required("proof is required"),
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const formik = useFormik({
    initialValues: {
      proofOfWork: "",
    },
    onSubmit: handleFinishMilestone,
    validationSchema: FinishMilestoneSchema,
  });

  return (
    <>
      <Button
        colorScheme="green"
        onClick={onOpen}
        rounded={"none"}
        w={"full"}
        size={"sm"}
        bg={useColorModeValue("gray.900", "gray.50")}
        color={useColorModeValue("white", "gray.900")}
        textTransform={"uppercase"}
        _hover={{
          transform: "translateY(2px)",
          boxShadow: "lg",
        }}
      >
        Finish
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Finish Milestone
            </AlertDialogHeader>

            <AlertDialogBody>
              {`Finish this milestone by submitting the proof of work. It can be a link to the work`}
              <form onSubmit={formik.handleSubmit}>
                <FormControl isInvalid={!!formik.errors.proofOfWork}>
                  <FormLabel>Proof</FormLabel>
                  <Input
                    id="proofOfWork"
                    name="proofOfWork"
                    isInvalid={
                      !!formik.errors.proofOfWork && formik.touched.proofOfWork
                    }
                    onChange={formik.handleChange}
                    value={formik.values.proofOfWork}
                  />
                  {!!formik.errors.proofOfWork && (
                    <FormErrorMessage>
                      {formik.errors.proofOfWork}
                    </FormErrorMessage>
                  )}
                </FormControl>

                <Button
                  isDisabled={isPending}
                  w="100%"
                  type="submit"
                  mt={8}
                  colorScheme="green"
                >
                  {isPending ? `Submitting` : `Submit`}
                </Button>
              </form>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
export default FinishMilestone;
