interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="w-full h-full p-2 lg:p-3 overflow-auto">{children}</div>
  );
};

export default Container;
