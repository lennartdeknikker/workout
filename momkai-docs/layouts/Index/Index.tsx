import IndexList from "@/root/components/IndexList/IndexList";

type DefaultProps = {
  children?: React.ReactNode;
  paths?: string[];
};

const Index = (props: DefaultProps) => {
  const { children, paths = [] } = props;
  return (
    <div className="Index">
      <aside>{paths?.length > 0 && <IndexList paths={paths} />}</aside>
      <main>{children}</main>
    </div>
  );
};

export default Index;
