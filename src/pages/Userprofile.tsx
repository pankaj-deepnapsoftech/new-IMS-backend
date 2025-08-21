import {
  Box,
  Flex,
  Avatar,
  Text,
  Heading,
  Stack,
  Button,
  Input,
  Divider,
  Badge,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { MdEmail, MdPhone, MdPerson, MdVerifiedUser } from "react-icons/md";
import { colors } from "../theme/colors";

const UserProfile: React.FC = () => {
  const data = useSelector((state: any) => state?.auth);
  


  return (
    <Box
      // minH="100vh"
      // py={{ base: 6, md: 10 }}
      // px={{ base: 4, md: 10 }}
      style={{
        backgroundColor: colors.background.page,
      }}
      className="flex justify-center items-center"
    >
      <Box w="full" maxW="6xl" mx="auto">
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={8}
          align="flex-start"
          justify="center"
        >
          <Card
            w="full"
            maxW={{ base: "100%", md: "500px", lg: "450px" }}
            mx="auto"
            style={{
              backgroundColor: colors.background.card,
              border: `1px solid ${colors.border.light}`,
              boxShadow: colors.shadow.sm,
            }}
          >
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Avatar and Info */}
                <Flex direction="column" align="center" py={4}>
                  <Avatar
                    size="xl"
                    name={`${data.firstname} ${data.lastname}`}
                    src={data.avatarUrl}
                    mb={4}
                    style={{
                      border: `4px solid ${colors.primary[100]}`,
                    }}
                  />
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    style={{ color: colors.text.primary }}
                    textAlign="center"
                  >
                    {data.firstname} {data.lastname}
                  </Heading>
                  <HStack mt={2} spacing={3} flexWrap="wrap" justify="center">
                    <Badge
                      variant="subtle"
                      style={{
                        backgroundColor: data.isVerified
                          ? colors.success[100]
                          : colors.warning[100],
                        color: data.isVerified
                          ? colors.success[700]
                          : colors.warning[700],
                      }}
                    >
                      <Icon as={MdVerifiedUser} mr={1} />
                      {data.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {data.role && (
                      <Badge
                        variant="subtle"
                        style={{
                          backgroundColor: colors.primary[100],
                          color: colors.primary[700],
                        }}
                      >
                        {data.role}
                      </Badge>
                    )}
                  </HStack>
                </Flex>

                <Divider style={{ borderColor: colors.border.light }} />

                {/* Form Fields */}
                <Stack spacing={5}>
                  {/* First Name */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdPerson} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        First Name
                      </Text>
                    </HStack>
                    <Input
                      value={data.firstname || ""}
                      isReadOnly
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      _focus={{
                        borderColor: colors.input.borderFocus,
                        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
                      }}
                    />
                  </Box>

                  {/* Last Name */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdPerson} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Last Name
                      </Text>
                    </HStack>
                    <Input
                      value={data.lastname || ""}
                      isReadOnly
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      _focus={{
                        borderColor: colors.input.borderFocus,
                        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
                      }}
                    />
                  </Box>

                  {/* Email */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdEmail} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Email Address
                      </Text>
                    </HStack>
                    <Input
                      value={data.email || ""}
                      isReadOnly
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      _focus={{
                        borderColor: colors.input.borderFocus,
                        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
                      }}
                    />
                  </Box>

                  {/* Phone Number */}
                  <Box>
                    <HStack mb={2}>
                      <Icon as={MdPhone} style={{ color: colors.primary[500] }} />
                      <Text fontWeight="semibold" fontSize="sm" style={{ color: colors.text.secondary }}>
                        Phone Number
                      </Text>
                    </HStack>
                    <Input
                      value={data.phone || ""}
                      placeholder="Enter your phone number"
                      style={{
                        backgroundColor: colors.input.background,
                        borderColor: colors.input.border,
                        color: colors.text.primary,
                      }}
                      _hover={{ borderColor: colors.input.borderHover }}
                      _focus={{
                        borderColor: colors.input.borderFocus,
                        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
                      }}
                    />
                  </Box>
                </Stack>

                <Divider style={{ borderColor: colors.border.light }} />

                {/* Action Buttons */}
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  spacing={4}
                  pt={2}
                >
                  <Button
                    flex="1"
                    style={{
                      backgroundColor: colors.button.primary,
                      color: colors.text.inverse,
                      padding: "12px 24px",
                    }}
                    _hover={{ backgroundColor: colors.button.primaryHover }}
                  >
                    User Profile
                  </Button>
                </Stack>
              </VStack>
            </CardBody>
          </Card>
        </Flex>
      </Box>
    </Box>

  );
};

export default UserProfile;
