import {
  Button,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import classes from "./Contact.module.css";

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted:", event);
  };

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      subject: (value) => (value.trim() === "" ? "Subject is required" : null),
      message: (value) => (value.trim() === "" ? "Message is required" : null),
    },
  });

  return (
    <div style={{ padding: "4rem 6rem" }}>
      <Paper shadow="md" radius={"lg"}>
        <div className={classes.wrapper}>
          <div
            className={classes.contacts}
            style={{
              backgroundImage: `url(${"https://media.istockphoto.com/id/531475568/photo/patient-and-medical-staff.jpg?s=612x612&w=0&k=20&c=KqciFJ4FCJMwY04Ucjx1ZJe_316jM65GAUlmbTmGzBk="})`,
            }}
          >
            <Text fz="lg" fw={700} className={classes.title} c="#fff">
              {/* Contact information */}
            </Text>

            <img></img>

            {/* <ContactIconsList /> */}
          </div>

          <form className={classes.form} onSubmit={form.onSubmit(handleSubmit)}>
            <Text fz="xl" fw={700} className={classes.title} mb="xl">
              Any Questions? Contact Us!
            </Text>

            <div className={classes.fields}>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label="Your name"
                  placeholder="Your name"
                  {...form.getInputProps("name")}
                />
                <TextInput
                  label="Your email"
                  placeholder="hello@mantine.dev"
                  {...form.getInputProps("email")}
                />
              </SimpleGrid>

              <TextInput
                mt="md"
                label="Subject"
                placeholder="Subject"
                {...form.getInputProps("subject")}
              />

              <Textarea
                mt="md"
                label="Your message"
                placeholder="Please include all relevant information"
                minRows={3}
                {...form.getInputProps("message")}
              />

              <Group justify="flex-end" mt="md">
                <Button type="submit" className={classes.control}>
                  Send message
                </Button>
              </Group>
            </div>
          </form>
        </div>
      </Paper>
    </div>
  );
};

export default Contact;
