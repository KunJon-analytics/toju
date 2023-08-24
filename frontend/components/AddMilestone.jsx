import React from "react";
import { Formik } from "formik";
import { SimpleGrid, VStack, Button } from "@chakra-ui/react";
import * as yup from "yup";
import { DateTime } from "luxon";
import { toast } from "react-toastify";

import { Input } from "../components/Form/Input";

const MilestoneSchema = yup.object().shape({
  title: yup
    .string()
    .min(1, "Title must be 1 character at minimum")
    .max(30, "Title must not exceed 30 characters")
    .required("Title is required"),
  deadline: yup.date().required("Deadline is required"),

  description: yup
    .string()
    .min(1, "Description must be 1 character at minimum")
    .max(400, "Title must not exceed 400 characters")
    .required("Description is required"),
});

const AddMilestone = ({ setProject, project }) => {
  const handleAddMilestone = (values) => {
    let prevDeadline = DateTime.now().toUnixInteger();
    if (!!project.endTimestamps.length) {
      prevDeadline = project.endTimestamps.slice(-1);
    }
    if (prevDeadline >= DateTime.fromISO(values.deadline).toUnixInteger()) {
      toast.error(
        "Deadline should be more than the previous milestone's / today",
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
    setProject((project) => {
      return {
        ...project,
        milestoneDescriptions: [
          ...project.milestoneDescriptions,
          values.description,
        ],
        milestoneTitles: [...project.milestoneTitles, values.title],
        endTimestamps: [
          ...project.endTimestamps,
          DateTime.fromISO(values.deadline).toUnixInteger(),
        ],
      };
    });
  };
  return (
    <Formik
      initialValues={{
        title: "",
        deadline: "",
        description: "",
      }}
      onSubmit={handleAddMilestone}
      validationSchema={MilestoneSchema}
    >
      {({ handleSubmit, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <VStack spacing="8">
            <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
              <Input
                name="title"
                label="Title"
                error={errors.title}
                touched={touched.title}
              />
              <Input
                name="deadline"
                label="Deadline"
                type="date"
                error={errors.deadline}
                touched={touched.deadline}
              />
            </SimpleGrid>
            <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
              <Input
                name="description"
                label="Milestone Description"
                error={errors.description}
                touched={touched.description}
              />
            </SimpleGrid>
          </VStack>
          <Button w="100%" type="submit" mt={8} colorScheme="green">
            Add
          </Button>
        </form>
      )}
    </Formik>
  );
};

export default AddMilestone;
