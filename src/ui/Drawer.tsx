import ClickMenu from "./ClickMenu";

interface DrawerProps {
  children: React.ReactNode;
  closeDrawerHandler: ()=>void,
}

const Drawer: React.FC<DrawerProps> = ({ children, closeDrawerHandler }) => {
  return (
    <ClickMenu top={0} right={0} closeContextMenuHandler={closeDrawerHandler}>
      {children}
    </ClickMenu>
  );
};

export default Drawer;
