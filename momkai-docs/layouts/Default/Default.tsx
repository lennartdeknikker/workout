import IndexList from "@/root/components/IndexList/IndexList";

type DefaultProps = {
  children?: React.ReactNode;
  indexedPaths?: string[];
  scope: any;
};

const Default = (props: DefaultProps) => {
  const { children, indexedPaths = [], scope } = props;

  return (
    <div className="Default">
      <aside>
        {indexedPaths?.length > 0 && <IndexList paths={indexedPaths} />}
      </aside>
      <main>
        <div className="Default-description">{scope?.description}</div>
        {children}
      </main>
    </div>
  );
};

export default Default;
