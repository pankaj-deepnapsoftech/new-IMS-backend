import { Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";
import { BiMinus } from "react-icons/bi";
import { IoIosAdd } from "react-icons/io";

interface ProcessProps{
  inputs: any[],
  setInputs: (input: any)=>void
}

const Process: React.FC<ProcessProps> = ({inputs, setInputs}) => {
  // const [inputs, setInputs] = useState<string[]>([""]);

  const addInputHandler = () => {
    setInputs((prev: any[]) => [...prev, ""]);
  };

  const deleteInputHandler = (ind: number) => {
    const inputsArr = [...inputs];
    inputsArr.splice(ind, 1);
    setInputs(inputsArr);
  };

  const onChangeHandler = (process: string, ind: number) => {
    const inputsArr = [...inputs];
    inputsArr[ind] = process;
    setInputs(inputsArr);
  };

  return (
    <div>
      <div>
        {inputs.map((input, ind) => (
          <FormControl key={ind} isRequired>
            <FormLabel color="black">Process</FormLabel>
            <Input
            className="text-gray-800"
              border="1px"
              borderColor="#a9a9a9"
              onChange={(e) => {
                onChangeHandler(e.target.value, ind);
              }}
              type="text"
              name="process"
              value={input}
            ></Input>
          </FormControl>
        ))}
      </div>
      <div className="text-end mt-1">
        {inputs.length > 1 && (
          <Button
            onClick={() => deleteInputHandler(inputs.length - 1)}
            leftIcon={<BiMinus />}
            variant="outline"
            className="mr-1 bg-[#a9a9a9]"
          >
            Remove
          </Button>
        )}
        <Button
          onClick={addInputHandler}
          leftIcon={<IoIosAdd />}
          variant="outline"
          className="bg-[#a9a9a9]"
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default Process;
