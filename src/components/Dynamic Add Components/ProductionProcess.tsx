// @ts-nocheck

import {
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Grid,
  GridItem,
  Stack,
} from "@chakra-ui/react";

interface ProductionProcessProps {
  inputs: any[];
  setInputs: (input: any) => void;
}

const ProductionProcess: React.FC<ProductionProcessProps> = ({
  inputs,
  setInputs,
}) => {
  const onStartChangeHandler = (isChecked: boolean, ind: number) => {
    const updatedInputs = [...inputs];
    updatedInputs[ind].start = isChecked;
    setInputs(updatedInputs);
  };

  const onDoneChangeHandler = (isChecked: boolean, ind: number) => {
    const updatedInputs = [...inputs];
    updatedInputs[ind].done = isChecked;
    setInputs(updatedInputs);
  };

  return (
    <div>
      <FormLabel fontWeight="bold">Processes</FormLabel>
      <Grid templateColumns="repeat(4, 1fr)" gap={4}>
        {inputs.map((input, ind) => (
          <GridItem
            key={ind}
            p={2}
            border="1px"
            borderColor="#a9a9a9"
            borderRadius="8px"
          >
            <Stack spacing={3}>
              <FormControl>
                <Input
                  isDisabled
                  border="1px"
                  borderColor="#a9a9a9"
                  type="text"
                  name="process"
                  value={input.process}
                />
              </FormControl>
              <Stack direction="row" spacing={4} align="center">
                <Checkbox
                  isChecked={input.start}
                  onChange={(e) => onStartChangeHandler(e.target.checked, ind)}
                >
                  Start
                </Checkbox>
                <Checkbox
                  isChecked={input.done}
                  onChange={(e) => onDoneChangeHandler(e.target.checked, ind)}
                >
                  Done
                </Checkbox>
              </Stack>
            </Stack>
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default ProductionProcess;
